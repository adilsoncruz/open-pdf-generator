# Multi-stage Dockerfile for Cloud Run Native PDF Playground API
# Context: repo root (docker build -f tools/playground-api/Dockerfile -t open-pdf-generator-api .)

# Stage 1 — build the CLI fat JAR
FROM eclipse-temurin:21-jdk AS jar

WORKDIR /src
COPY core ./core
COPY tools/cli ./tools/cli
COPY config ./config

RUN chmod +x core/gradlew tools/cli/gradlew \
    && core/gradlew -p core jar -q \
    && tools/cli/gradlew -p tools/cli shadowJar -q

# Stage 2 — trace runtime reflection/resources and build the native image
FROM ghcr.io/graalvm/native-image-community:21 AS native

WORKDIR /build
COPY --from=jar /src/tools/cli/build/libs/pdf-generator-cli-*.jar cli.jar
COPY tools/cli/native-image/train ./train
COPY tools/cli/native-image/generate-reflect-config.sh ./generate-reflect-config.sh

RUN mkdir -p /build/meta \
    && sh ./generate-reflect-config.sh cli.jar /build/meta \
    && java -agentlib:native-image-agent=config-merge-dir=/build/meta -jar cli.jar \
        generate train/invoice.json -d train/data_invoice.json -o out1.pdf \
    && java -agentlib:native-image-agent=config-merge-dir=/build/meta -jar cli.jar \
        generate train/listing.json -d train/data_listing.json -o out2.pdf \
    && java -agentlib:native-image-agent=config-merge-dir=/build/meta -jar cli.jar \
        generate train/complex.json -d train/data_complex.json -o out3.pdf \
    && java -agentlib:native-image-agent=config-merge-dir=/build/meta -jar cli.jar \
        validate train/invoice.json \
    && java -agentlib:native-image-agent=config-merge-dir=/build/meta -jar cli.jar version

RUN native-image \
        --no-fallback \
        -march=compatibility \
        -Djava.awt.headless=true \
        -jar cli.jar \
        -o /build/pdf-generator \
        -H:ConfigurationFileDirectories=/build/meta \
        -H:+ReportExceptionStackTraces \
        --initialize-at-run-time=org.slf4j.LoggerFactory,org.slf4j.helpers.Reporter,ch.qos.logback \
        --initialize-at-build-time=java.awt.Color,java.awt.Toolkit,java.awt.image,java.awt.color,java.awt.Insets \
        -H:IncludeResources='logback.xml' \
    && /build/pdf-generator version

# Stage 3 — build the lightweight Go HTTP API
FROM golang:1.24-bookworm AS go-builder

WORKDIR /app
COPY tools/playground-api/go.mod ./
COPY tools/playground-api/main.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/api-server .

# Stage 4 — minimal runtime for Cloud Run
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /work \
    && chmod 1777 /work \
    && adduser --system --group --home /work pdf

COPY --from=native /build/pdf-generator /usr/local/bin/pdf-generator
COPY --from=go-builder /app/api-server /usr/local/bin/api-server

ENV PORT=8080
ENV PDF_GENERATOR_BIN=/usr/local/bin/pdf-generator

WORKDIR /work
USER pdf

EXPOSE 8080

CMD ["/usr/local/bin/api-server"]
