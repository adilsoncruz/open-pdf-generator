import re

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
    content = f.read()

# Make sure imports are present
if "import com.pdfgenerator.model.RichTextElement" not in content:
    content = content.replace("import com.pdfgenerator.model.TextElement", 
                              "import com.pdfgenerator.model.TextElement\nimport com.pdfgenerator.model.RichTextElement\nimport com.pdfgenerator.model.LinkElement")

# coordinate adjustment
content = content.replace("is TextElement -> element.copy(x = adjustedX, y = adjustedY)", 
                          "is TextElement -> element.copy(x = adjustedX, y = adjustedY)\n            is LinkElement -> element.copy(x = adjustedX, y = adjustedY)\n            is RichTextElement -> element.copy(x = adjustedX, y = adjustedY)")

# calculateLoopItemHeight
content = content.replace("is TextElement -> element.height ?: 20f",
                          "is TextElement -> element.height ?: 20f\n                    is LinkElement -> element.height ?: 20f\n                    is RichTextElement -> element.height ?: 20f")

# getElementHeight block
text_block = """            is TextElement -> {
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

rich_text_block = text_block.replace("is TextElement", "is RichTextElement")
link_element_block = text_block.replace("is TextElement", "is LinkElement")

if "is RichTextElement -> {" not in content:
    content = content.replace(text_block, link_element_block + "\n" + rich_text_block + "\n" + text_block)

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
    f.write(content)
