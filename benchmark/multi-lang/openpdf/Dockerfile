# Open PDF Generator CLI benchmark runner (exec-per-document, same image as consumers).
#
# Build from the repository root:
#   docker build \
#     --build-arg JAR_FILE=tools/cli/build/libs/pdf-generator-cli-1.0.2.jar \
#     -t open-pdf-bench:openpdf-cli \
#     -f benchmark/multi-lang/openpdf/Dockerfile .
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache bash python3

ARG JAR_FILE
COPY ${JAR_FILE} /app/pdf-generator-cli.jar
COPY benchmark/common/src/main/resources/templates/openpdf/ /app/templates/
COPY benchmark/multi-lang/openpdf/driver.py /app/driver.py

ENTRYPOINT ["python3", "/app/driver.py"]
