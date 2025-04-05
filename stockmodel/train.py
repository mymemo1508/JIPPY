import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# 날짜 별로 매출 및 제품 수량에 대한 통계 정보를 생성하는 함수
def preprocess_data(df):
    # 날짜 추출
    df['updated_at'] = pd.to_datetime(df['updated_at'], format = 'mixed')

    # 모든 상품의 수량을 합산하기 위한 준비
    quantity_columns = [
        'buyProduct[0].product_quantity',
        'buyProduct[1].product_quantity',
        'buyProduct[2].product_quantity',
        'buyProduct[3].product_quantity'
    ]

    # NaN 값을 0으로 처리 (상품이 없는 경우)
    for col in quantity_columns:
        df[col] = df[col].fillna(0)

    # 전체 상품 수량 계산
    df['total_quantity'] = df[quantity_columns].sum(axis=1)

    # 날짜별로 제품 수량 합계
    daily_sales = df.groupby(df['updated_at'].dt.date).agg({
        'total_cost': 'sum',
        'total_quantity': 'sum'
    }).reset_index()

    # 7일 단위로 제품 수량 평균 계산
    daily_sales['MA7_quantity'] = daily_sales['total_quantity'].rolling(window=7).mean()
    # 7일 평균 판매 금액 계산
    daily_sales['MA7_sales'] = daily_sales['total_cost'].rolling(window=7).mean()

    daily_sales['year'] = daily_sales['updated_at'].dt.year
    daily_sales['month'] = daily_sales['updated_at'].dt.month
    daily_sales['day'] = daily_sales['updated_at'].dt.day
    daily_sales['dayofweek'] = daily_sales['updated_at'].dt.dayofweek
    # 달을 기준으로 계절 매핑 (계절 = season)
    daily_sales['season'] = daily_sales['month'].map({
        1:1, 2:1, 3:2, 4:2, 5:2, 6:3,
        7:3, 8:3, 9:4, 10:4, 11:4, 12:1
    })

    return daily_sales

def train_and_evaluate_model(X_train, X_test, y_train, y_test):
    # 모델 초기화 및 학습
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    model.fit(X_train, y_train)

    # 예측 및 평가
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    return model

def main():
    # 데이터 로드
    df = pd.read_csv('data/Cluster0.payment_history.csv')

    # 데이터 전처리
    daily_sales = preprocess_data(df)

    # 특성과 타겟 변수 준비
    features = ['year', 'month', 'day', 'dayofweek', 'season']
    X = daily_sales[features]
    y = daily_sales['total_quantity']

    # 학습/테스트 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 모델 학습 및 평가
    model = train_and_evaluate_model(X_train, X_test, y_train, y_test)

    # 특성 중요도 확인
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    # 모델 저장
    model_filename = 'stock_model/sales_prediction_model.joblib'
    joblib.dump(model, model_filename)

    # 스케일러 저장
    scaler = StandardScaler()
    scaler.fit(X)
    joblib.dump(scaler, 'stock_model/scaler.joblib')

    return model, daily_sales

if __name__ == "__main__":
    model, daily_sales = main()