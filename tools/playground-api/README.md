# Open PDF Generator - Playground API

Serviço HTTP leve construído com Go e CLI Nativo (GraalVM) para renderização sob demanda no Web Playground.

## Endpoints

- `GET /health` — Health check (Cloud Run)
- `POST /api/generate-preview` — Gera preview e retorna `{ success: true, pdfBase64: "..." }`
- `POST /api/render` — Devolve o binário do PDF direto (`Content-Type: application/pdf`)

## Executando Localmente com Docker

A partir da raiz do repositório:

```bash
docker build -f tools/playground-api/Dockerfile -t open-pdf-generator-api .
docker run -p 8080:8080 open-pdf-generator-api
```

Teste o endpoint:

```bash
curl -X POST http://localhost:8080/api/generate-preview \
  -H "Content-Type: application/json" \
  -d '{"templateJson":"{\"version\":\"1.0\",\"pageSettings\":{\"size\":\"A4\",\"orientation\":\"portrait\",\"margins\":{\"top\":36,\"right\":36,\"bottom\":36,\"left\":36}},\"page\":[{\"type\":\"text\",\"id\":\"t1\",\"x\":50,\"y\":50,\"value\":\"Hello Web!\"}]}","dataJson":"{}"}'
```

## Deploy no Google Cloud Run (Camada Gratuita)

Instale a Google Cloud CLI (`gcloud`) e execute na raiz do repositório:

```bash
gcloud run deploy open-pdf-generator-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3
```

Após o deploy, configure a URL gerada no segredo ou variável do GitHub:
- `OPEN_PDF_PLAYGROUND_API_URL`: `https://open-pdf-generator-api-xxxx.a.run.app`
