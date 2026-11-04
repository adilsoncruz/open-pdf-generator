# Especificação de Conversão: JasperReports (JRXML) para Open PDF Generator

Este documento define a especificação canônica de De-Para e as regras de transformação determinística de arquivos JRXML (JasperReports) para templates JSON declarativos do **Open PDF Generator**.

---

## 1. Mapeamento Estrutural e de Bandas

| JasperReports (JRXML) | Open PDF Generator | Regra de Transformação |
| :--- | :--- | :--- |
| `<jasperReport>` | `pageSettings` | Atributos `pageWidth` e `pageHeight` definem `pageSettings.customSize` ou padrões (`A4`, `LETTER`, `A5`). Margens mapeadas em `pageSettings.margins`. Atributo `orientation` (`portrait` ou `landscape`). |
| `<background>` | `pageSettings.bodyBackground` / `watermark` | Se contiver textos diagonais/grandes, vira marca d'água (`watermark`). Se contiver formas geométricas ou molduras, vira `bodyBackground`. |
| `<title>` | `pageElements` (topo) | Elementos estáticos e dinâmicos iniciais da página. A altura da banda (`band.height`) acumula no offset vertical (`yOffset`) para as seções seguintes. |
| `<pageHeader>` | `pageSettings.header` | Cabeçalho global repetido em todas as páginas, contendo `height` e lista de `elements`. |
| `<columnHeader>` | Bloco estático ou `TableElement` | Quando associado a um `<detail>` tabular, é absorvido como cabeçalho da tabela (`TableElement.columns`). Quando o detail não for tabular, seus elementos são emitidos antes do `LoopElement`. |
| `<detail>` | `TableElement` ou `LoopElement` | **Heurística de Tabela**: se houver `<columnHeader>` e os `<textField>` do `<detail>` forem alinhados horizontalmente em linha única, converte para `TableElement` (`dataBinding = defaultItemsBinding`).<br>**Fallback de Loop**: se o layout for heterogêneo (múltiplas linhas, imagens, cards), converte para `LoopElement` com coordenadas relativas internas (iniciando em `y = 0`). |
| `<columnFooter>` | `pageElements` | Elementos de encerramento posicionados imediatamente após a tabela ou loop. |
| `<pageFooter>` | `pageSettings.footer` | Rodapé global de página com `height` e lista de `elements`. |
| `<summary>` | `summaryPage` ou fim da página | Se o relatório tiver `isSummaryNewPage="true"`, converte para `summaryPage` (página dedicada de fechamento). Caso contrário, seus elementos são adicionados ao final de `pageElements`. |

---

## 2. Elementos Gráficos e de Conteúdo

### 2.1 staticText (Texto Estático)
* **Tag JRXML**: `<staticText>`
* **Elemento Destino**: `StaticTextElement` (`type: "static_text"`) ou `TextElement` (`type: "text"`)
* **Mapeamento de Atributos**:
  * `<reportElement x="..." y="..." width="..." height="...">` -> `x, y, width, height`
  * `<text><![CDATA[Valor]]></text>` -> `value: "Valor"`
  * `<reportElement forecolor="#0F172A">` -> `style.color: "#0F172A"`
  * `<textElement textAlignment="..." verticalAlignment="...">` -> `style.alignment`, `style.verticalAlignment`
  * `<font fontName="..." size="..." isBold="..." isItalic="...">` -> `style.fontFamily`, `style.fontSize`, `style.fontWeight: "bold"`, `style.fontStyle: "italic"`

### 2.2 textField (Texto Dinâmico / Expressão)
* **Tag JRXML**: `<textField>`
* **Elemento Destino**: `TextElement` (`type: "text"`)
* **Mapeamento de Atributos**:
  * `<textFieldExpression><![CDATA[$F{nome}]]></textFieldExpression>` -> `dataBinding: "nome"`
  * Expressão literal `"Texto Fixo"` -> `value: "Texto Fixo"`
  * `<reportElement><printWhenExpression><![CDATA[$F{ativo} == true]]></printWhenExpression></reportElement>` -> `printCondition: "ativo == true"`

### 2.3 line (Linha Divisória)
* **Tag JRXML**: `<line>`
* **Elemento Destino**: `LineElement` (`type: "line"`)
* **Mapeamento de Atributos**:
  * `<graphicElement><pen lineWidth="1.0" lineColor="#CBD5E1"/></graphicElement>` -> `style.width: 1.0`, `style.color: "#CBD5E1"`
  * Se a linha for vertical (`width == 1` e `height > 1`), preserva dimensões para renderizador.

### 2.4 rectangle (Retângulo / Container Visual)
* **Tag JRXML**: `<rectangle radius="4">`
* **Elemento Destino**: `RectangleElement` (`type: "rectangle"`)
* **Mapeamento de Atributos**:
  * `reportElement.backcolor` -> `style.fillColor`
  * `graphicElement.pen.lineColor` ou `reportElement.forecolor` -> `style.borderColor`
  * `graphicElement.pen.lineWidth` -> `style.borderWidth`
  * `rectangle.radius` -> `style.cornerRadius`

### 2.5 image (Imagens e Logotipos)
* **Tag JRXML**: `<image>`
* **Elemento Destino**: `ImageElement` (`type: "image"`)
* **Mapeamento de Atributos**:
  * `<imageExpression><![CDATA[$P{logoUrl}]]></imageExpression>` -> `dataBinding: "logoUrl"`
  * `<imageExpression><![CDATA["/caminho/local.png"]]></imageExpression>` -> `source: "/caminho/local.png"`
  * Padrão de ajuste: `fit: "contain"`, `alignment: "center"`

### 2.6 componentElement: Barcode & QR Code
* **Tag JRXML**: `<componentElement><jr:QRCode>` ou `<componentElement><jr:Code128>`
* **Elemento Destino**: `BarcodeElement` (`type: "barcode"`)
* **Mapeamento de Atributos**:
  * `<jr:QRCode>` -> `barcodeType: "qr_code"`
  * `<jr:Code128>` ou `<barbecue:barcode128>` -> `barcodeType: "code128"`
  * Conteúdo da expressão de código -> `dataBinding` ou `value`

### 2.7 componentElement: Lista / Loop
* **Tag JRXML**: `<componentElement><jr:list>`
* **Elemento Destino**: `LoopElement` (`type: "loop"`)
* **Mapeamento de Atributos**:
  * `<datasetRun>` -> `dataBinding` (ex: `items`)
  * `<jr:listContents>` -> lista `elements` com posições relativas à linha (`y` relativo).

### 2.8 frame (Agrupamento com Offset Local)
* **Tag JRXML**: `<frame>`
* **Elemento Destino**: `ContainerElement` (`type: "container"`) ou Achatamento de Coordenadas
* **Mapeamento**:
  * As coordenadas dos elementos filhos são transladadas somando `frame.x` e `frame.y`.

---

## 3. Expressões e Data Binding

| Expressão JasperReports | Sintaxe Open PDF Generator | Descrição |
| :--- | :--- | :--- |
| `$F{campo}` | `campo` | Campo do objeto da lista iterada |
| `$P{parametro}` | `parametro` | Parâmetro ou variável raiz do payload |
| `$V{PAGE_NUMBER}` | `dataBinding: "pageNumber"` | Número da página atual |
| `"Página " + $V{PAGE_NUMBER}` | `dataBinding: "pageNumber \| prefix:'Página '"` | Número da página com prefixo |
| `$V{PAGE_NUMBER} + " de "` | `dataBinding: "pageNumber \| suffix:' de '"` | Número da página com sufixo |
| `"Pág. " + $V{PAGE_NUMBER} + " de " + $P{total}` | `value: "Pág. ${pageNumber} de ${total}"` | Concatenação dinâmica interpolada |
| `$F{nome}.toUpperCase()` | `nome \| uppercase` | Filtro de transformação nativo |
| `$F{nome}.toLowerCase()` | `nome \| lowercase` | Filtro de transformação nativo |
| `String.format("%.2f", $F{v})` | `v \| currency('BRL')` | Formatação de moeda |
| `new SimpleDateFormat("...").format($F{d})` | `d \| date('dd/MM/yyyy')` | Formatação de data |
| `$F{campo} != null` | `printCondition: "campo != null"` | Expressão condicional booleana |

---

## 4. Estratégia de Resolução dos Gaps Técnicos

### Gap 1: Herança de `<style>` e Estilos Globais
* **Problema**: Jasper permite definir tags `<style name="BaseText" isDefault="true" fontName="Arial" fontSize="10"/>` no cabeçalho do documento, além de estilos herdados `<style name="BoldHeader" style="BaseText" isBold="true"/>`.
* **Solução**:
  1. No início do parsing, construir uma tabela de símbolos (`Map<String, JasperStyle>`).
  2. Identificar o estilo com `isDefault="true"` como fallback base para todos os textos.
  3. Resolver a cadeia de herança (`style.parent`).
  4. Ao converter `<staticText>` ou `<textField>`, aplicar a precedência:
     `Estilo Default` -> `Estilo Nomeado (style="...")` -> `Propriedades inline do elemento`.

### Gap 2: Mapeamento de `<subreport>`
* **Problema**: Relatórios Jasper dividem partes do layout em subreports externos (`.jrxml` ou `.jasper`). No Open PDF Generator não utilizamos sub-templates desacoplados em tempo de geração.
* **Solução**:
  1. **Inline via `ContainerElement`**:
     * Todo `<subreport>` é convertido em um `ContainerElement` com as dimensões (`x`, `y`, `width`, `height`) do elemento no template pai.
     * O conversor localiza o arquivo `.jrxml` referenciado (em `subreportExpression`) relativo ao diretório do arquivo pai (`baseDir`).
  2. **Extração de `dataSourceExpression`**:
     * Sintaxe Jasper típica: `<dataSourceExpression><![CDATA[new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource($F{orderItems})]]></dataSourceExpression>`.
     * O conversor extrai o binding interno (`orderItems`) e o propaga como `defaultItemsBinding` para a conversão recursiva do subreport (fazendo tabelas e loops internos adotarem essa coleção).
  3. **Resiliência e Ausência de Arquivo**:
     * Se o arquivo referenciado não for encontrado no disco, a conversão **não quebra**.
     * É emitido um aviso estruturado (`JasperConversionWarning`) e o `ContainerElement` é gerado com `elements = []` preservando posição e tamanho no layout.

### Gap 3: Gráficos (`<chart>`, `<pieChart>`, `<barChart>`)
* **Problema**: Jasper Reports possui motor JFreeChart embutido no compilador Java.
* **Solução**:
  1. O motor Open PDF Generator foca em renderização declarativa leve de PDFs vetoriais.
  2. O conversor mapeia elementos de gráfico para `ImageElement` (`dataBinding = "graficoVendasUrl"` ou `base64`).
  3. O backend emissor gera a imagem do gráfico (via biblioteca de charts leve ou SVG) e a injeta no payload.

### Gap 4: Matrizes e Tabelas Cruzadas (`<crosstab>`)
* **Problema**: `<crosstab>` gera colunas dinâmicas em tempo de execução com base nos valores únicos de uma dimensão.
* **Solução**:
  1. Tabelas cruzadas devem ser pré-pivotadas no payload de dados (`data.json`).
  2. O conversor gera uma `TableElement` padrão mapeando as colunas pivotadas resultantes.

### Gap 5: Scripts Java Inline (`<scriptlet>`)
* **Problema**: Execução arbitrária de código Java em runtime do Jasper.
* **Solução**:
  1. Não-suporte intencional para segurança e portabilidade multiplataforma.
  2. As regras de cálculo/transformação devem residir no pipeline de dados que gera o JSON para o Open PDF Generator.
