# Stage 1: Build the application using Maven and Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies (supports root build context)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build production package
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create lightweight production runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy JAR artifact from builder stage
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

# Configure container-aware JVM settings and launch application
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar --server.port=${PORT}"]
