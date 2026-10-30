# O que é o Open PDF Generator?

**Open PDF Generator** é uma engine moderna Kotlin/Java de alto throughput para renderizar documentos PDF de nível corporativo a partir de templates JSON declarativos.

Projetada como uma substituição cloud-native para engines de relatórios legadas como o JasperReports, ela combina um runtime leve, cold starts em milissegundos, pipelines de bytes em streaming e um designer visual desktop.

## Visão Geral

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
│  JSON Template  │  +   │    JSON Data    │  →   │  High-Speed PDF Engine  │  →  PDF File / Stream
└─────────────────┘      └─────────────────┘      └─────────────────────────┘
```

Você define a estrutura, a geometria e o estilo do documento em um formato JSON limpo e injeta dados dinâmicos em runtime. A engine avalia expressões, vincula campos, cuida da paginação dinâmica e gera PDFs vetoriais em streaming com overhead mínimo de memória.

---

## Por que o Open PDF Generator?

### 🚀 Ultra-Leve e Cloud Native
- **Footprint total de dependências de 4.0 MB** (3.4x mais leve que o JasperReports).
- **Cold start de 195 ms** em containers JVM padrão — execução instantânea no AWS Lambda, Google Cloud Run e Kubernetes.
- Zero dependências de compilador externo em runtime ou geração pesada dinâmica de bytecode.

### ⚡ Throughput Extremo (8.650 docs/seg)
- Pipeline de geração totalmente não-bloqueante e escalável em múltiplos núcleos.
- Gera **100.000 faturas em ~12 segundos** dentro de um container de 2 vCPU / 1 GB RAM.
- Streaming zero-copy (`generateToStream`) direto para sockets de rede e corpos de resposta HTTP.

### 📄 Templates JSON Declarativos
- Sem ciclos de compilação XML ou artefatos binários proprietários `.jasper`.
- Templates são JSON puro: facilmente versionados no Git, gerados dinamicamente ou armazenados em bancos de dados.
- Validação nativa com JSON Schema (Draft-07) integrada.

### 🔗 Data Binding e Expressões Poderosas
- Interpolação mustache (<code v-pre>{{customer.name}}</code>) e caminhos de data binding.
- **Mais de 30 pipes de transformação** (moedas, datas, números, operações de string).
- Renderização condicional booleana (`printCondition`) e loops de iteração (`loop`).

### 🎨 Studio Visual Desktop
- **Open PDF Studio** construído sobre o design system Studio Slate.
- Canvas com arrastar e soltar, edição multi-abas, pré-visualização ao vivo em tempo real e exportação direta em JSON.

---

## Comparação Direta: Open PDF Generator vs JasperReports

| Métrica / Funcionalidade | Open PDF Generator | JasperReports 6.21.4 | JasperReports 7.0.3 | Vantagem do Open PDF |
|:---|:---:|:---:|:---:|:---:|
| **Throughput (container 2 vCPU)** | **8.650 docs/seg** | 3.338 docs/seg | 3.539 docs/seg | **2.4x - 2.6x mais rápido** |
| **Cold Start (latência do 1º doc)** | **195 ms** | 1.166 ms | 742 ms | **3.8x - 4.3x mais rápido** |
| **Memória RSS do Container (100k docs)** | **128 MB** *(sem pausas de GC)* | 164 MB *(pausas pesadas de GC)* | 171 MB *(baseline alto)* | **25% menos memória** |
| **Footprint de Dependências em Runtime** | **4.0 MB** | 13.6 MB+ (até 50MB) | 25.2 MB (modular + JDT) | **6.3x mais leve** |
| **Formato de Template** | **JSON** declarativo | **JRXML / XML** complexo | **Jackson XML** mais rígido | Amigável ao Git, sem compilação |
| **Designer Visual** | ✅ Open PDF Studio | ✅ Jaspersoft Studio | ✅ Jaspersoft Studio | UI moderna em Electron/React |
| **API de Streaming** | ✅ `OutputStream` direto | ⚠️ Exige buffer em memória | ⚠️ Exige buffer em memória | Byte stream zero-copy |
| **Licença** | **LGPL-3.0** *(Grátis, uso comercial OK)* | LGPL-3.0 / Comercial | LGPL-3.0 / Comercial | Mesma liberdade |

> 📊 **Explore as Evidências Completas:** Veja benchmarks JMH, resultados de estresse em containers com cgroup e análise de custos FinOps na nuvem em nosso [Relatório de Benchmark](/lib/benchmark).

---

## Elementos Suportados

| Elemento | Descrição |
|:---|:---|
| **Texto** | Tipografia com famílias de fonte, tamanhos, alinhamento, quebra de linha e bindings dinâmicos |
| **Tabela** | Layouts em grade, definições multicolumn, quebra automática de página e headers repetidos |
| **Imagem** | Inserção via URL, arquivo local ou Base64 com preservação da proporção |
| **Container** | Caixa de agrupamento de layout com bordas, paddings e preenchimentos de fundo |
| **Marca d'água** | Marcas d'água de texto ou imagem em múltiplas páginas, com opacidade e rotação configuráveis |
| **Código de Barras & QR** | Códigos de barra (Code 128, EAN, 39) e QR Codes renderizados diretamente como gráficos vetoriais |
| **Quebra de Página** | Controle explícito e programático de paginação |
| **Retângulo & Linha** | Acentos geométricos, divisores e formas decorativas |
| **Loop** | Seções repetidas sobre arrays JSON dinâmicos |
| **Condicional** | Renderização contextual com base em regras de negócio booleanas |
| **Página de Resumo** | Página dedicada de encerramento/apêndice para totais, termos e assinaturas |

---

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│            Your Application / Microservice             │
│        (Spring Boot, Quarkus, Micronaut, Ktor)         │
└────────────────────────────────────────────────────────┘
                           │
       generate(template, data) / generateToStream(...)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Open PDF Generator Engine                │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Template Parser & JSON Schema Draft-07         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Expression Evaluator & Data-Binding Pipeline   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Layout Planner & Dynamic Pagination Engine     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   High-Efficiency Vector Renderer (OpenPDF 2.x)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        Vector PDF Output (Memory or Stream)            │
└────────────────────────────────────────────────────────┘
```

---

## Casos de Uso Comuns

### Faturamento e Cobrança em Alto Volume
- Notas fiscais eletrônicas, contas de serviços, recibos e confirmações de pedidos.
- Quebra automática de página em tabelas de produtos multipage, subtotal e QR Codes fiscais.

### Relatórios e Demonstrações Financeiras
- Resumos de portfólio, extratos de conta e históricos de transações tabulares.
- Headers e footers com numeração dinâmica de páginas (<code v-pre>Page {{page}} of {{pages}}</code>).

### Etiquetas de Envio e Logística
- Romaneios de palete, manifestos de embalagem e notas de expedição com códigos de barra Code 128.

### Contratos e Certificados
- Acordos formais com parágrafos justificados, marcas d'água personalizadas e blocos de assinatura.

---

## Requisitos

- **Java 11+** ou **Kotlin 1.8+**
- **Gradle** ou **Maven**
- Roda nativamente em containers Linux, macOS e Windows (Alpine, Distroless, Debian).

---

## Próximos Passos

- [Guia de Instalação](/pt/lib/guide/installation) - Adicione a dependência ao Gradle/Maven
- [Tutorial de Primeiros Passos](/pt/lib/guide/first-steps) - Gere sua primeira fatura em 5 minutos
- [Especificação de Templates](/pt/lib/guide/templates) - Explore o formato de templates JSON
- [⚡ Estudo de Caso de Benchmark](/lib/benchmark) - Veja métricas detalhadas de performance e containers
