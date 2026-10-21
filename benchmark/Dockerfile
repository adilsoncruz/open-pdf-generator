FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN apk add --no-cache bash

ARG JAR_FILE=jasper6/build/libs/open-pdf-benchmark-jasper6.jar
COPY ${JAR_FILE} /app/benchmark.jar

ENTRYPOINT ["java", "-cp", "/app/benchmark.jar", "com.pdfgenerator.benchmark.ContainerBenchmarkRunnerKt"]
CMD ["all", "300", "4"]
