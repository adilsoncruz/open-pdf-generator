import re

def process_pdf_generator():
    with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
        content = f.read()

    # 1. Remove RichTextElement block in getElementHeight
    start_idx = content.find("            is RichTextElement -> {")
    if start_idx != -1:
        brace_count = 0
        in_block = False
        end_idx = -1
        for i in range(start_idx, len(content)):
            if content[i] == '{':
                brace_count += 1
                in_block = True
            elif content[i] == '}':
                brace_count -= 1
            if in_block and brace_count == 0:
                end_idx = i
                break
        if end_idx != -1:
            if end_idx + 1 < len(content) and content[end_idx + 1] == '\n':
                end_idx += 1
            content = content[:start_idx] + content[end_idx+1:]

    # Remove single line references to RichTextElement
    lines = content.split('\n')
    lines = [line for line in lines if "RichTextElement" not in line]
    content = '\n'.join(lines)

    # 2. Add LinkElement imports and cases
    # Import
    if "import com.pdfgenerator.model.LinkElement" not in content:
        content = content.replace("import com.pdfgenerator.model.TextElement", "import com.pdfgenerator.model.TextElement\nimport com.pdfgenerator.model.LinkElement")
    
    # adjustElementForBody
    content = content.replace("is TextElement -> element.copy(x = adjustedX, y = adjustedY)", "is TextElement -> element.copy(x = adjustedX, y = adjustedY)\n            is LinkElement -> element.copy(x = adjustedX, y = adjustedY)")
    
    # getElementHeight text element block
    search_str = """            is TextElement -> {
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)
                if (element.style?.multiline == true && element.width != null) {
                    val text = resolveTextForHeight(element.dataBinding, element.value, data)
                    if (text != null) {
                        TextRenderer
                            .getOrMeasureMultilineLayout(
                                elementId = element.id,
                                resolvedText = text,
                                styleHash = element.style?.hashCode() ?: 0,
                                boxWidth = element.width,
                                fontSize = element.style?.fontSize ?: 12f,
                                lineHeight = element.style?.lineHeight,
                                paddingTop = element.style?.paddingTop ?: 0f,
                                paddingBottom = element.style?.paddingBottom ?: 0f,
                                paddingLeft = element.style?.paddingLeft ?: 0f,
                                paddingRight = element.style?.paddingRight ?: 0f,
                                firstLineIndent = element.style?.firstLineIndent ?: 0f,
                                fontFamily = element.style?.fontFamily ?: "Helvetica",
                                cache = context.textLayoutCache,
                            ).contentHeight
                    } else {
                        definedHeight
                    }
                } else {
                    definedHeight
                }
            }"""
    if search_str in content:
        content = content.replace(search_str, search_str.replace("is TextElement", "is LinkElement") + "\n" + search_str)
    
    # height property
    content = content.replace("is TextElement -> element.height ?: 20f", "is TextElement -> element.height ?: 20f\n                    is LinkElement -> element.height ?: 20f")

    with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
        f.write(content)


def process_render_engine():
    with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "r") as f:
        content = f.read()
    
    lines = content.split('\n')
    lines = [line for line in lines if "RichTextElement" not in line and "RichTextRenderer" not in line]
    content = '\n'.join(lines)
    
    if "import com.pdfgenerator.adapter.openpdf.LinkRenderer" not in content:
        content = content.replace("import com.pdfgenerator.adapter.openpdf.TextRenderer", "import com.pdfgenerator.adapter.openpdf.TextRenderer\nimport com.pdfgenerator.adapter.openpdf.LinkRenderer")
    if "import com.pdfgenerator.model.LinkElement" not in content:
        content = content.replace("import com.pdfgenerator.model.TextElement", "import com.pdfgenerator.model.TextElement\nimport com.pdfgenerator.model.LinkElement")
        
    content = content.replace("private val textRenderer = TextRenderer()", "private val textRenderer = TextRenderer()\n    private val linkRenderer = LinkRenderer()")
    content = content.replace("is TextElement -> textRenderer.render(element, context)", "is TextElement -> textRenderer.render(element, context)\n            is LinkElement -> linkRenderer.render(element, context)")
    
    with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "w") as f:
        f.write(content)

process_pdf_generator()
process_render_engine()

