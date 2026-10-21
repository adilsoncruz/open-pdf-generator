FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY build/libs/open-pdf-benchmark.jar /app/benchmark.jar

ENTRYPOINT ["java", "-cp", "/app/benchmark.jar", "com.pdfgenerator.benchmark.ContainerBenchmarkRunnerKt"]
CMD ["all", "300", "4"]
