# Node.js runner (pdfmake + Node-invoked pdf-generator) — build context: repository root
FROM node:22-bookworm-slim

WORKDIR /app
COPY benchmark/multi-lang/node/package.json benchmark/multi-lang/node/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY benchmark/multi-lang/node/bench.js ./
COPY --from=open-pdf-generator:native /usr/local/bin/pdf-generator /usr/local/bin/pdf-generator
COPY benchmark/common/src/main/resources/templates/openpdf/ /app/templates/

RUN adduser --system --group bench \
    && mkdir -p /app/reports /tmp \
    && chown -R bench:bench /app /tmp

USER bench

ENV TEMPLATES_DIR=/app/templates \
    CLI_BIN=/usr/local/bin/pdf-generator

ENTRYPOINT ["node", "bench.js"]
