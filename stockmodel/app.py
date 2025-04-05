from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import joblib
import pandas as pd
import uvicorn
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# .env 파일 로드
load_dotenv()

app = FastAPI(
    title = "판매 재고 예측 API",
    description = "판매 재고 예측 API"
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://52.79.170.206",
    "http://52.79.170.206:5173",
    "http://52.79.170.206:3000",
    "https://jippy.duckdns.org",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # 허용할 오리진 리스트
    allow_credentials=True,        # 쿠키 등 인증 정보 허용
    allow_methods=["*"],           # 모든 HTTP 메서드 허용
    allow_headers=["*"],           # 모든 헤더 허용
)


MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client[os.getenv("MONGODB_NAME")]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'stock_model', 'sales_prediction_model.joblib')

try :
    model = joblib.load(MODEL_PATH)
except Exception as e :
    raise Exception("모델 로딩 실패")

class ChartData(BaseModel) :
    status : str = "success"
    message : str = ""
    data : Dict[str, Any]

@app.get("/api/{storeId}/predictions/weekly", response_model=ChartData)
async def predict_weekly_sales(storeId: int) :
    try :
        start_date = datetime.now()
        dates = [start_date + timedelta(days=i) for i in range(7)]

        chart_data = {
            "labels" : [],
            "datasets" : [
                {
                    "name" : "예측 판매량",
                    "data" : []
                },
                {
                    "name": "신뢰구간 상한",
                    "data": []
                },
                {
                    "name": "신뢰구간 하한",
                    "data": []
                }
            ],
            "statistics" : {
                "total_predicted" : 0,
                "average_daily" : 0,
                "max_predicted" : 0,
                "min_predicted" : float('inf')
            },
            "predictions" : []
        }

        for date in dates :
            features = {
                'year' : date.year,
                'month' : date.month,
                'day' : date.day,
                'dayofweek' : date.weekday(),
                'season' : (date.month % 12 + 3) // 3
            }

            input_df = pd.DataFrame([features])

            prediction = float(model.predict(input_df)[0])
            confidence_interval = prediction * 0.1

            chart_data["labels"].append(date.strftime("%Y-%m-%d"))
            chart_data["datasets"][0]["data"].append(prediction)
            chart_data["datasets"][1]["data"].append(prediction + confidence_interval)
            chart_data["datasets"][2]["data"].append(max(0, prediction - confidence_interval))

            chart_data["statistics"]["total_predicted"] += prediction
            chart_data["statistics"]["max_predicted"] = max(
                chart_data["statistics"]["max_predicted"],
                prediction
            )

            chart_data["statistics"]["min_predicted"] = min(
                chart_data["statistics"]["min_predicted"],
                prediction
            )

            chart_data["predictions"].append({
                "date" : date.strftime("%Y-%m-%d"),
                "day_of_week" : date.strftime("%A"),
                "predicted_quantity" : prediction,
                "confidence_interval" : confidence_interval,
                "features_used" : features
            })

        chart_data["statistics"]["average_daily"] = (
            chart_data["statistics"]["total_predicted"] / len(dates)
        )

        return ChartData(
            status = "success",
            message = "Weekly predictions generated successfully",
            data = chart_data
        )
    
    except Exception as e :
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/{storeId}/stock/comparison", response_model=ChartData)
async def get_stock_comparison(storeId: int) :
    try :
        collection = db[os.getenv("MONGODB_COLLECTION")]
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        pipeline = [
            {
                "$match": {
                    "store_id": storeId,
                    "payment_status" : "구매"
                }
            },
            {
                "$addFields": {
                    "date_field": {
                        "$dateFromString": {
                            "dateString": "$updated_at",
                            "format": "%Y-%m-%d %H:%M:%S"
                        }
                    },
                    "total_quantity": {
                        "$reduce": {
                            "input": "$buyProduct",
                            "initialValue": 0,
                            "in": {
                                "$add": [
                                    "$$value",
                                    {"$ifNull": ["$$this.product_quantity", 0]}
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$date_field"
                        }
                    },
                    "actual_quantity": {"$sum": "$total_quantity"},
                    "total_sales": {"$sum": "$total_cost"}
                }
            },
            {"$sort": {"_id": 1}}
        ]

        print(f"Start Date: {start_date}")
        print(f"End Date: {end_date}")
        print(f"Store ID: {storeId}")
        
        actual_sales = await collection.aggregate(pipeline).to_list(None)
        print(f"Found {len(actual_sales)} records")
        print(f"Sample aggregated data: {actual_sales[:2] if actual_sales else 'No data found'}")

        chart_data = {
            "labels": [],
            "datasets": [
                {
                    "name": "실제 판매량",
                    "data": []
                },
                {
                    "name": "예측 판매량",
                    "data": []
                }
            ],
            "statistics": {
                "total_actual": 0,
                "total_predicted": 0,
                "accuracy_metrics": {
                    "mape": 0,
                    "correlation": 0
                }
            },
            "comparison_data": []
        }

        for sale in actual_sales :
            date = datetime.strptime(sale["_id"], "%Y-%m-%d")
            features = {
                'year' : date.year,
                'month' : date.month,
                'day' : date.day,
                'dayofweek' : date.weekday(),
                'season' : (date.month % 12 + 3) // 3
            }

            input_df = pd.DataFrame([features])
            predicted_quantity = float(model.predict(input_df)[0])
            actual_quantity = sale["actual_quantity"]

            chart_data["labels"].append(sale["_id"])
            chart_data["datasets"][0]["data"].append(actual_quantity)
            chart_data["datasets"][1]["data"].append(predicted_quantity)

            chart_data["statistics"]["total_actual"] += actual_quantity
            chart_data["statistics"]["total_predicted"] += predicted_quantity

            chart_data["comparison_data"].append({
                "date" : sale["_id"],
                "actual" : actual_quantity,
                "predicted" : predicted_quantity,
                "difference" : actual_quantity - predicted_quantity,
                "difference_percentage" : ((actual_quantity - predicted_quantity) / actual_quantity * 100)
                if actual_quantity != 0 else 0
            })

        if chart_data["comparison_data"] :
            mape = sum(
                abs(data["difference_percentage"])
                for data in chart_data["comparison_data"]
            ) / len(chart_data["comparison_data"])
            chart_data["statistics"]["accuracy_metrics"]["mape"] = mape

        return ChartData(
            status = "success",
            message = "Sales comparison data generated successfully",
            data = chart_data
        )
    
    except Exception as e :
        raise HTTPException(status_code=500, detail=f"{str(e)}")
    
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
