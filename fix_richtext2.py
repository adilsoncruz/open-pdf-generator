with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
    content = f.read()

content = content.replace("is TextElement -> element.copy(x = adjustedX, y = adjustedY)", "is TextElement -> element.copy(x = adjustedX, y = adjustedY)\n            is RichTextElement -> element.copy(x = adjustedX, y = adjustedY)")

content = content.replace("is TextElement -> element.height ?: 20f", "is TextElement -> element.height ?: 20f\n                    is RichTextElement -> element.height ?: 20f")

# For getElementHeight, add a dummy block
search_str = """            is TextElement -> {"""
replacement = """            is RichTextElement -> {
                element.height ?: (element.style?.fontSize ?: 12f)
            }
            is TextElement -> {"""

content = content.replace(search_str, replacement)

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
    f.write(content)

with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "r") as f:
    content = f.read()

content = content.replace("is TextElement -> textRenderer.render(element, context)", "is TextElement -> textRenderer.render(element, context)\n            is RichTextElement -> richTextRenderer.render(element, context)")
content = content.replace("private val textRenderer = TextRenderer()", "private val textRenderer = TextRenderer()\n    private val richTextRenderer = RichTextRenderer()")

with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "w") as f:
    f.write(content)
