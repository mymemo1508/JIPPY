# app.py
import os
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from konlpy.tag import Mecab
from collections import Counter
import uvicorn
from dotenv import load_dotenv

load_dotenv()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 데이터베이스 연결 정보 로드
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
connection_string = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine: Engine = create_engine(connection_string, pool_recycle=3600)

# 저장된 모델 경로가 있으면 로드, 없으면 기본 모델 다운로드 (운영 환경에서는 저장된 모델이 있어야 함)
model_dir = "./kcelectra_sentiment"
if os.path.exists(model_dir):
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
else:
    model_name = "Beomi/KcELECTRA-base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

model.to(device)
model.eval()

# 예측 함수 정의
def predict_sentiment(model, tokenizer, sentence, max_len=128):
    model.eval()
    encoding = tokenizer(
        sentence,
        add_special_tokens=True,
        max_length=max_len,
        truncation=True,
        padding='max_length',
        return_tensors="pt"
    )
    encoding = {key: val.to(device) for key, val in encoding.items()}
    with torch.no_grad():
        outputs = model(**encoding)
        logits = outputs.logits
        prediction = torch.argmax(logits, dim=1).item()
    return "positive" if prediction == 1 else "negative"

# 형태소 분석기 (Mecab) 초기화  
# ※ 실제 배포 환경에 맞게 dicpath가 올바른지 확인하세요.
mecab = Mecab(dicpath='/usr/local/lib/mecab/dic/mecab-ko-dic')

def extract_keywords(texts, top_n=5):
    all_nouns = []
    for text in texts:
        nouns = mecab.nouns(text)
        all_nouns.extend(nouns)
    counter = Counter(all_nouns)
    keywords = [word for word, count in counter.most_common(top_n)]
    return keywords

# 카테고리 매핑 (DB의 category 값 해석)
CATEGORY_MAPPING = {
    1: "서비스 관련",
    2: "실시간 서비스 관련",
    3: "제품 관련",
    4: "기타 서비스 관련"
}

# FastAPI 애플리케이션 생성
app = FastAPI(title="Customer Feedback Sentiment API")

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


@app.get("/predictions/{store_id}")
def get_predictions(store_id: int):
    """
    지정된 store_id의 고객 피드백 데이터를 MySQL에서 조회하여  
    각 피드백에 대해 긍정/부정 예측을 수행하고 결과를 반환합니다.
    """
    query = text("SELECT category, content, created_at FROM store_feedback WHERE store_id = :store_id ORDER BY created_at desc")
    
    positive_reviews = []
    negative_reviews = []
    with engine.connect() as connection:
        results = connection.execute(query, {"store_id": store_id})
        for row in results:
            category, content, created_at = row
            sentiment = predict_sentiment(model, tokenizer, content)
            review_data = {
                "category": CATEGORY_MAPPING.get(category, str(category)),
                "content": content,
                "created_at": str(created_at),
                "sentiment": sentiment
            }
            if sentiment == "positive":
                positive_reviews.append(review_data)
            else:
                negative_reviews.append(review_data)
    
    positive_count = len(positive_reviews)
    negative_count = len(negative_reviews)
    positive_samples = positive_reviews[:5] if positive_reviews else []
    negative_samples = negative_reviews[:5] if negative_reviews else []
    
    positive_texts = [review["content"] for review in positive_reviews]
    negative_texts = [review["content"] for review in negative_reviews]
    positive_keywords = extract_keywords(positive_texts) if positive_texts else []
    negative_keywords = extract_keywords(negative_texts) if negative_texts else []
    
    return {
        "store_id": store_id,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "positive_samples": positive_samples,
        "negative_samples": negative_samples,
        "positive_keywords": positive_keywords,
        "negative_keywords": negative_keywords
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
