# 1단계: 빌드 단계
FROM python:3.11-slim as builder

WORKDIR /build

# 파이썬 출력 버퍼링 및 pyc 파일 생성을 비활성화
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 시스템 업데이트 및 빌드에 필요한 패키지 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git curl bash python3-dev wget build-essential automake autoconf libtool pkg-config && \
    rm -rf /var/lib/apt/lists/*

#########################
# MeCab 설치
#########################
RUN wget https://bitbucket.org/eunjeon/mecab-ko/downloads/mecab-0.996-ko-0.9.2.tar.gz && \
    tar -zxvf mecab-0.996-ko-0.9.2.tar.gz && \
    rm mecab-0.996-ko-0.9.2.tar.gz

WORKDIR /build/mecab-0.996-ko-0.9.2
RUN ./configure --prefix=/usr/local && \
    make && \
    make install && \
    ldconfig

#########################
# mecab-ko-dic 설치
#########################
WORKDIR /build
RUN wget https://bitbucket.org/eunjeon/mecab-ko-dic/downloads/mecab-ko-dic-2.0.1-20150920.tar.gz && \
    tar -zxvf mecab-ko-dic-2.0.1-20150920.tar.gz && \
    rm mecab-ko-dic-2.0.1-20150920.tar.gz

WORKDIR /build/mecab-ko-dic-2.0.1-20150920
RUN ./autogen.sh && ./configure --prefix=/usr/local && make && make install && ldconfig

#########################
# mecab-python 설치 (Python binding)
#########################
WORKDIR /build
RUN git clone https://bitbucket.org/eunjeon/mecab-python-0.996.git mecab-python-0.996
WORKDIR /build/mecab-python-0.996
RUN python setup.py build && python setup.py install

# 2단계: 런타임 이미지
FROM python:3.11-slim

WORKDIR /app

# 필요한 런타임 패키지 설치 (예: OpenJDK는 실제 애플리케이션에서 사용하는 경우만)
RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jdk-headless && \
    rm -rf /var/lib/apt/lists/*

#########################
# 빌드 단계에서 설치한 MeCab 관련 바이너리, 라이브러리 복사
#########################
COPY --from=builder /usr/local /usr/local

#########################
# PATH 업데이트: /usr/local/bin 에 설치된 MeCab 바이너리를 찾을 수 있도록 함
#########################
ENV PATH="/usr/local/bin:${PATH}"
ENV MECAB_CONFIG="/usr/local/bin/mecab-config"
ENV LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}"

# 애플리케이션 코드 및 requirements.txt 복사
COPY requirements.txt .
COPY . .

RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
