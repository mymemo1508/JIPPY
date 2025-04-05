# Step 1: JDK 21 Base Image
FROM amazoncorretto:21 AS builder

# TimeZone 설정
ENV TZ Asia/Seoul

# Step 2: 작업 디렉토리 설정
WORKDIR /app

# Step 3: 프로젝트 복사 및 빌드
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

COPY src src
RUN ./gradlew bootJar --no-daemon

# Step 4: 실행용 이미지
FROM amazoncorretto:21
WORKDIR /app

# Secret File 복사 (Jenkins에서 제공)
COPY application.properties /app/config/application.properties
COPY serviceAccountKey.json /app/config/serviceAccountKey.json

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=file:/app/config/application.properties"]
