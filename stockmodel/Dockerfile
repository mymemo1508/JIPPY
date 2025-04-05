# 1단계: 빌드 단계
FROM python:3.12-slim as builder

WORKDIR /build

# 시스템 업데이트 및 빌드에 필요한 패키지 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git curl bash python3-dev wget build-essential automake autoconf libtool pkg-config && \
    rm -rf /var/lib/apt/lists/*

# 애플리케이션 코드 및 requirements.txt 복사
COPY requirements.txt .
COPY . .

RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
