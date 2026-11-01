# Open PDF Generator CLI — Docker image
#
# Publishable image usable from ANY host language (Go, Node.js, Python, Ruby, ...):
# the app shells out to `docker run` and either mounts a workdir or pipes
# JSON in / PDF out through stdin/stdout.
#
# Build (from repository root):
#   docker build -t open-pdf-generator:cli tools/cli/
#
# File-based usage:
#   docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
#     generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf
#
# Piped usage (preferred for Go/Node integration — no volume needed):
#   cat data.json | docker run --rm -i \
#     -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
#     generate /templates/invoice.json -d - -o - > invoice.pdf
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache bash \
    && mkdir -p /work /templates \
    && chmod 1777 /work /templates \
    && addgroup -S pdf && adduser -S pdf -G pdf

COPY build/libs/pdf-generator-cli-*.jar /app/pdf-generator-cli.jar

WORKDIR /work
USER pdf

ENTRYPOINT ["java", "-jar", "/app/pdf-generator-cli.jar"]
CMD ["--help"]
