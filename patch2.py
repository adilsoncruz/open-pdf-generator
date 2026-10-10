with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
    content = f.read()

if "import com.pdfgenerator.model.RichTextElement" not in content:
    content = content.replace("import com.pdfgenerator.model.TextElement", "import com.pdfgenerator.model.TextElement\nimport com.pdfgenerator.model.RichTextElement\nimport com.pdfgenerator.model.LinkElement")

content = content.replace("is RichTextElement -> element.copy(x = adjustedX, y = adjustedY)", "is RichTextElement -> element.copy(x = adjustedX, y = adjustedY)\n            is LinkElement -> element.copy(x = adjustedX, y = adjustedY)")

content = content.replace("is RichTextElement -> element.height ?: 20f", "is RichTextElement -> element.height ?: 20f\n                    is LinkElement -> element.height ?: 20f")

link_block = """            is LinkElement -> {
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

if "is LinkElement -> {" not in content:
    content = content.replace("is RichTextElement -> {", link_block + "\n            is RichTextElement -> {")

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
    f.write(content)
