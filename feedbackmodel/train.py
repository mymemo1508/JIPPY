# train.py
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import pandas as pd
from sklearn.model_selection import train_test_split
import evaluate
import numpy as np
from dotenv import load_dotenv

# 환경 변수 로드 (.env 파일에 DB 정보 등 설정)
load_dotenv()

# 디바이스 설정 (GPU 사용 가능 시 GPU 사용)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 및 토크나이저 로드
model_name = "Beomi/KcELECTRA-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
model.to(device)

# 데이터셋 로드 (Excel 파일)
df = pd.read_excel('한국어_단발성_대화_데이터셋.xlsx')

# 감정을 긍정/부정으로 매핑하는 함수
def map_emotion_to_sentiment(emotion):
    if emotion in ['행복', '놀람', '중립']:
        return 1  # positive
    else:
        return 0  # negative

df['label'] = df['Emotion'].apply(map_emotion_to_sentiment)

# 학습/검증 데이터 분할 (레이블 분포 유지)
train_df, val_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=42)

# 최대 토큰 길이
MAX_LEN = 128

# Dataset 클래스 정의
class EmotionDataset(torch.utils.data.Dataset):
    def __init__(self, dataframe, tokenizer, max_length):
        self.data = dataframe.reset_index(drop=True)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        text = str(self.data.loc[idx, "Sentence"])
        label = int(self.data.loc[idx, "label"])
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            truncation=True,
            padding='max_length',
            return_tensors="pt"
        )
        item = {key: encoding[key].squeeze() for key in encoding}
        item["labels"] = torch.tensor(label, dtype=torch.long)
        return item

train_dataset = EmotionDataset(train_df, tokenizer, MAX_LEN)
val_dataset = EmotionDataset(val_df, tokenizer, MAX_LEN)

# TrainingArguments 설정
training_args = TrainingArguments(
    output_dir="./kcelectra_sentiment",  # 모델 저장 경로
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    eval_strategy="epoch",  # 에포크마다 평가
    save_strategy="epoch",         # 에포크마다 모델 저장
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy"
)

# 평가 지표 (accuracy)
accuracy_metric = evaluate.load("accuracy")
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return accuracy_metric.compute(predictions=predictions, references=labels)

# Trainer 객체 생성
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics
)

# 모델 학습
trainer.train()

# 평가 후 결과 출력
eval_result = trainer.evaluate()
print("\nEvaluation results:")
print(eval_result)

# 학습 완료 후 모델과 토크나이저 저장 (이후 API 서버에서 로드)
model.save_pretrained("./kcelectra_sentiment")
tokenizer.save_pretrained("./kcelectra_sentiment")
