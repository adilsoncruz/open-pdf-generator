# Go runner (Maroto + Go-invoked pdf-generator) — build context: repository root
# Requires Go >= 1.26.1 (Maroto v2.4.4 go.mod constraint).
FROM golang:1.27-alpine AS build

WORKDIR /src
COPY benchmark/multi-lang/go/go.mod ./
COPY benchmark/multi-lang/go/go.sum ./
COPY benchmark/multi-lang/go/*.go ./
RUN go mod tidy
RUN CGO_ENABLED=0 go build -trimpath -o /out/runner .

# Stage 2: Debian runtime with GraalVM native pdf-generator, runner and templates
FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/templates /app/reports \
    && adduser --system --group bench \
    && chown -R bench:bench /app

COPY --from=open-pdf-generator:native /usr/local/bin/pdf-generator /usr/local/bin/pdf-generator
COPY --from=build /out/runner /usr/local/bin/runner
COPY benchmark/common/src/main/resources/templates/openpdf/ /app/templates/

USER bench
WORKDIR /app

ENV TEMPLATES_DIR=/app/templates \
    CLI_BIN=/usr/local/bin/pdf-generator

ENTRYPOINT ["runner"]
