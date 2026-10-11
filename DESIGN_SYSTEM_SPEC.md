# Especificação do Design System & Arquitetura de Informação
## Open PDF Generator Studio

---

### 1. Paleta de Cores e Tokens Base
* **Canvas Workspace:** `#0B0F19` (Slate profundo de alto contraste)
* **Superfície dos Painéis (Sidebars, Topbar):** `#111827` (Slate 900)
* **Bordas Estruturais:** `#1F2937` (Slate 800)
* **Hover / Seleção Secundária:** `#374151` (Slate 700)
* **Destaque Primário (Brand Accent):** `#6366F1` (Electric Indigo) - Ações primárias e bounding box de seleção
* **Linhas Guia (Guides):** `#06B6D4` (Cyan) - Guias magnéticas arrastadas das réguas
* **Estados de Validação:**
  * Sucesso / Conectado: `#10B981` (Emerald)
  * Alerta / Validação Pendente: `#F59E0B` (Amber)

---

### 2. Mapa de Navegação e Ícones

#### A. TopBar (Ações Globais e Ferramentas)
| Ícone / Controle | Rótulo | Função |
| :--- | :--- | :--- |
| `FileText` / Menu | Arquivo | Novo, Abrir, Salvar Template, Exportar JSON |
| Input Editável | Nome do Template | Renomear arquivo atual (ex: `fatura_v2.json`) |
| `Undo` / `Redo` | Desfazer / Refazer | Histórico de alterações com atalhos `Ctrl+Z` / `Ctrl+Y` |
| `Ruler` / `Magnet` | Snap & Guias | Ligar/desligar magnetismo da régua e encaixe |
| `ZoomIn/Out` | Controle de Zoom | Escala (`40%` a `200%`, `Ajustar à Tela`) |
| `Database` | Dados de Teste | Abre gaveta para injetar JSON simulado |
| `SplitSquare` | Modo Split / Preview | Divide tela entre Canvas e PDF final renderizado |
| `Play` (Indigo) | **Gerar PDF** | Compilação via motor CLI local |

---

#### B. Barra Lateral Esquerda (Tabs: Biblioteca & Estrutura de Bandas)

##### Tab 1: Biblioteca de Elementos
* **Básicos (Tipografia & Links):**
  * `T` **Texto:** Bloco de texto padrão com suporte a expressões `${variavel}`.
  * `¶` **Rich Text:** Texto formatado com Markdown (`**negrito**`, `*itálico*`).
  * `🔗` **Link:** Texto ou âncora clicável com URL externa.
* **Estrutura & Fluxo:**
  * `⊞` **Container:** Bloco agrupador com posicionamento absoluto ou relativo.
  * `↕` **Espaçador:** Espaço vertical flexível entre blocos.
  * `✂` **Quebra de Página:** Força transição para a próxima página no fluxo.
* **Mídia & Formas:**
  * `🖼` **Imagem:** Imagem estática ou base64 com proporção fixa/esticada.
  * `▦` **Tabela:** Grade de dados dinâmica vinculada a listas.
  * `▥` **Código de Barras / QR:** Gerador nativo com redundância.
  * `▭` **Retângulo / Linha:** Divisores decorativos.

##### Tab 2: Estrutura / Camadas (Árvore de Bandas)
1. **Background Layer:** Fundo da página (marcas d'água, timbrado).
2. **Header Band:** Faixa superior fixa (ex: 65mm).
3. **Body Content Band:** Fluxo contínuo com repetição de registros.
4. **Summary Band:** Totais, impostos e assinaturas (apenas na última página).
5. **Footer Band:** Rodapé fixo (ex: 25mm) com numeração.

---

#### C. Canvas Central (Réguas e Linhas Guias)
1. **Régua Horizontal (Top) & Vertical (Left):**
   * Graduação em milímetros (`mm`) ou pixels (`px`).
   * **Mecanismo de Guias:** Clicar e arrastar da régua para o centro cria uma linha guia ciano (`#06B6D4`).
   * Tooltip dinâmico exibindo a coordenada exata durante o arraste (`X: 45.0mm`).
2. **Divisores Visuais de Bandas:**
   * Linhas tracejadas horizontais na folha com alças de redimensionamento (`Header [65mm]`, `Footer [25mm]`).
3. **Elemento Selecionado:**
   * Bounding box azul índigo com 8 pontos de ancoragem e etiqueta de tamanho (`W: 180mm x H: 40mm`).

---

#### D. Barra Lateral Direita (Inspetor de Propriedades)
* **Transform:** Posição (`X`, `Y`) e Dimensões (`Largura`, `Altura`).
* **Tipografia:** Família da fonte, tamanho, alinhamento, entrelinha.
* **Aparência:** Cor de preenchimento, borda, cantos arredondados, opacidade.
* **Dados & Lógica:** Data binding (`items.total`), condição de impressão (`printCondition`).

---

#### E. Status Bar Inferior
* `Página 1 de 2`
* `Coordenadas do Cursor: X: 110mm | Y: 75mm`
* `Status do Motor CLI: v1.0.2 Conectado ●`
* `Tempo de Execução do Preview: 12ms`
