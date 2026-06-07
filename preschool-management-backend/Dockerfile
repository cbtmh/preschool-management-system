FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp

# Tham số JAR_FILE trỏ tới file .jar sau khi đã build
ARG JAR_FILE=target/*.jar

# Copy file jar vào trong container với tên app.jar
COPY ${JAR_FILE} app.jar

# Giới hạn RAM cho JVM để phù hợp với AWS EC2 t2.micro (1GB RAM)
# Tránh lỗi Out Of Memory (OOM) làm sập server
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Lệnh chạy khi container khởi động
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app.jar"]
