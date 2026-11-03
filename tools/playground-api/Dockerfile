# Multi-stage Dockerfile for Cloud / Render Playground API

# Stage 1 — build the CLI fat JAR
FROM eclipse-temurin:21-jdk AS jar

WORKDIR /src
COPY core ./core
COPY tools/cli ./tools/cli
COPY config ./config

RUN chmod +x core/gradlew tools/cli/gradlew \
    && core/gradlew -p core jar -q \
    && tools/cli/gradlew -p tools/cli shadowJar -q

# Stage 2 — build the lightweight Go HTTP API
FROM golang:1.24-bookworm AS go-builder

WORKDIR /app
COPY tools/playground-api/go.mod ./
COPY tools/playground-api/main.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/api-server .

# Stage 3 — runtime with Temurin JRE
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache bash ca-certificates \
    && mkdir -p /work /app \
    && chmod 1777 /work \
    && addgroup -S pdf && adduser -S pdf -G pdf

COPY --from=jar /src/tools/cli/build/libs/pdf-generator-cli-*.jar /app/pdf-generator.jar
COPY --from=go-builder /app/api-server /usr/local/bin/api-server

ENV PORT=8080
ENV PDF_GENERATOR_JAR=/app/pdf-generator.jar
ENV JAVA_TOOL_OPTIONS="-Xms32m -Xmx256m -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

WORKDIR /work
USER pdf

EXPOSE 8080

CMD ["/usr/local/bin/api-server"]
