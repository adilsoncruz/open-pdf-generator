package io.pdfgenerator.cli.converter.jasper

import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.CustomSize
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LineStyle
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RectangleStyle
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.SummaryPage
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TemplateMetadata
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.NodeList
import java.io.File
import java.io.InputStream
import java.time.LocalDate
import java.util.UUID
import javax.xml.parsers.DocumentBuilderFactory

/**
 * Converts JasperReports JRXML templates into this project's [Template] format.
 *
 * Current scope intentionally focuses on the most common base components:
 * - staticText
 * - textField
 * - line
 * - rectangle
 * - image
 */
object JasperTemplateConverter {
    fun fromString(
        jrxml: String,
        options: JasperConversionOptions = JasperConversionOptions(),
    ): Template {
        val document = buildDocument(jrxml.byteInputStream())
        return convertDocument(document, options)
    }

    fun fromFile(
        path: String,
        options: JasperConversionOptions = JasperConversionOptions(),
    ): Template {
        val document = buildDocument(File(path).inputStream())
        return convertDocument(document, options)
    }

    fun fromInputStream(
        input: InputStream,
        options: JasperConversionOptions = JasperConversionOptions(),
    ): Template {
        val document = buildDocument(input)
        return convertDocument(document, options)
    }

    private fun buildDocument(input: InputStream): Document {
        return input.use {
            val factory =
                DocumentBuilderFactory.newInstance().apply {
                    isNamespaceAware = false
                    setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
                    setFeature("http://xml.org/sax/features/external-general-entities", false)
                    setFeature("http://xml.org/sax/features/external-parameter-entities", false)
                }
            val builder = factory.newDocumentBuilder()
            builder.parse(it).apply { documentElement.normalize() }
        }
    }

    fun hasSubreport(jrxmlFile: File): Boolean {
        val document = buildDocument(jrxmlFile.inputStream())
        val nodeList = document.getElementsByTagName("subreport")
        return nodeList.length > 0
    }

    private fun convertSection(
        sectionNodes: NodeList,
        offset: Float,
        maxWidth: Float,
        options: JasperConversionOptions,
    ): Map<String, *> {
        var yOffset = 0f + offset
        val elements = mutableListOf<com.pdfgenerator.model.Element>()
        for (sectionIdx in 0 until sectionNodes.length) {
            val sectionNode = sectionNodes.item(sectionIdx)
            if (sectionNode is Element) {
                val bands = sectionNode.getElementsByTagName("band")
                if (bands.length == 1) {
                    val bandNode = bands.item(0)
                    if (bandNode is Element) {
                        val bandHeight = bandNode.getIntAttribute("height", 0).toFloat()
                        elements.addAll(parseBandElements(bandNode, yOffset, options, null))
                        yOffset += bandHeight
                    }
                } else {
                    for (bandIdx in 0 until bands.length) {
                        val bandNode = bands.item(bandIdx)
                        if (bandNode is Element) {
                            val bandHeight = bandNode.getIntAttribute("height", 0).toFloat()
                            elements.add(parseBand(bandNode, yOffset, maxWidth, options, null))
                            yOffset += bandHeight
                        }
                    }
                }
            }
        }

        return mapOf(
            "elements" to elements,
            "height" to yOffset,
        )
    }

    private fun convertDocument(
        document: Document,
        options: JasperConversionOptions,
    ): Template {
        val root = document.documentElement
        if (root == null || root.tagName != "jasperReport") {
            throw JasperTemplateConversionException("JRXML inválido: raiz <jasperReport> não encontrada")
        }

        val pageWidth = root.getIntAttribute("pageWidth", 595)
        val pageHeight = root.getIntAttribute("pageHeight", 842)
        val orientation = root.getAttribute("orientation").ifBlank { "Portrait" }

        val margins =
            Margins(
                top = root.getIntAttribute("topMargin", 20).toFloat(),
                right = root.getIntAttribute("rightMargin", 20).toFloat(),
                bottom = root.getIntAttribute("bottomMargin", 20).toFloat(),
                left = root.getIntAttribute("leftMargin", 20).toFloat(),
            )

        var pageSettings =
            PageSettings(
                size = "CUSTOM",
                orientation = if (orientation.equals("landscape", ignoreCase = true)) "landscape" else "portrait",
                margins = margins,
                customSize = CustomSize(pageWidth.toFloat(), pageHeight.toFloat()),
                header = null,
                footer = null,
                bodyBackground = null,
            )
        val containerWidth = pageWidth.toFloat() - margins.left - margins.right
        val metadata =
            TemplateMetadata(
                name = root.getAttribute("name"),
                description = "Converted from JasperReports JRXML",
                author = options.author,
                created = LocalDate.now().toString(),
                tags = listOf("jasper", "jrxml", "converted"),
            )

        var elements = mutableListOf<com.pdfgenerator.model.Element>()
        var summaryElem: List<com.pdfgenerator.model.Element>? = null
        val sectionOrder = listOf("background", "title", "pageHeader", "columnHeader", "detail", "columnFooter", "pageFooter", "summary")
        var yOffset = 0f

        for (sectionTag in sectionOrder) {
            val sectionNodes = root.getElementsByTagName(sectionTag)
            when (sectionTag) {
                "background" -> {
                    val sectionElements = convertSection(sectionNodes, 0f, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        pageSettings = pageSettings.copy(bodyBackground = BodyBackground(out))
                    }
                }
                "title" -> {
                    val sectionElements = convertSection(sectionNodes, 0f, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        yOffset = sectionElements.get("height") as Float
                        elements.addAll(out)
                    }
                }
                "pageHeader" -> {
                    val sectionElements = convertSection(sectionNodes, 0f, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        pageSettings =
                            pageSettings.copy(header = HeaderFooter(sectionElements.get("height") as Float, out))
                    }
                }
                "pageFooter" -> {
                    val sectionElements = convertSection(sectionNodes, 0f, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        pageSettings =
                            pageSettings.copy(footer = HeaderFooter(sectionElements.get("height") as Float, out))
                    }
                }
                "summary" -> {
                    val sectionElements = convertSection(sectionNodes, 0f, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        summaryElem = out
                    }
                }
                else -> {
                    val sectionElements = convertSection(sectionNodes, yOffset, containerWidth, options)
                    val out = sectionElements.get("elements") as List<com.pdfgenerator.model.Element>
                    if (out.isNotEmpty()) {
                        elements.addAll(out)
                    }
                }
            }
        }
        return Template(
            version = "1.0",
            metadata = metadata,
            pageSettings = pageSettings,
            pageElements = elements,
            summaryPage = summaryElem?.let { SummaryPage(summaryElem) },
        )
    }

    private fun parseComponentElement(
        node: Element,
        sectionYOffset: Float,
        options: JasperConversionOptions,
        frame: Map<String, Float>?,
    ): List<com.pdfgenerator.model.Element>? {
        val out = mutableListOf<com.pdfgenerator.model.Element>()
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        var children = node.childNodes

        for (idx in 0 until children.length) {
            val child = children.item(idx)
            if (child !is Element) continue

            when (child.tagName) {
                "jr:QRCode" -> parseJrQrCode(reportElement, child, sectionYOffset, frame)?.let(out::add)
                "jr:list" -> parseJrList(reportElement, child, sectionYOffset, options, frame)?.let(out::add)
            }
        }
        return out
    }

    private fun parseJrList(
        reportElement: Element,
        node: Element,
        sectionYOffset: Float,
        options: JasperConversionOptions,
        frame: Map<String, Float>?,
    ): LoopElement? {
        var expression = node.firstDirectChild("datasetRun")?.textContent?.trim().orEmpty()
        val content = node.firstDirectChild("jr:listContents")
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val out = parseBandElements(content!!, 0f, options, frame)

        return LoopElement(
            type = "loop",
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            dataBinding = dataBinding ?: "",
            elements = out,
            printCondition = printCondition,
        )
    }

    private fun parseBand(
        node: Element,
        sectionYOffset: Float,
        maxWidth: Float,
        options: JasperConversionOptions,
        frame: Map<String, Float>?,
    ): ContainerElement {
        val out = parseBandElements(node, 0f, options, frame)

        return ContainerElement(
            type = "container",
            id = UUID.randomUUID().toString(),
            x = node.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = node.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = maxWidth,
            height = node.getIntAttribute("height", 16).toFloat(),
            relativeOffsetY = 0f,
            elements = out,
        )
    }

    private fun parseJrQrCode(
        reportElement: Element,
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): BarcodeElement? {
        var expression = node.firstDirectChild("jr:QRCode")?.textContent?.trim().orEmpty()
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        return BarcodeElement(
            type = "barcode",
            barcodeType = "barcodeType",
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            dataBinding = dataBinding ?: "",
            printCondition = condition,
        )
    }

    private fun parseFrame(
        node: Element,
        sectionYOffset: Float,
        options: JasperConversionOptions,
    ): List<com.pdfgenerator.model.Element>? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val x = reportElement.getIntAttribute("x", 0).toFloat()
        val y = reportElement.getIntAttribute("y", 0).toFloat()
        val out =
            parseBandElements(
                node,
                sectionYOffset,
                options,
                mapOf(
                    "x" to x,
                    "y" to y,
                ),
            ).toMutableList()

        return out
    }

    private fun parseBandElements(
        band: Element,
        sectionYOffset: Float,
        options: JasperConversionOptions,
        frame: Map<String, Float>?,
    ): List<com.pdfgenerator.model.Element> {
        val out = mutableListOf<com.pdfgenerator.model.Element>()

        val children = band.childNodes
        for (idx in 0 until children.length) {
            val child = children.item(idx)
            if (child !is Element) continue

            when (child.tagName) {
                "staticText" -> parseStaticText(child, sectionYOffset, frame)?.let(out::add)
                "textField" -> parseTextField(child, sectionYOffset, frame)?.let(out::add)
                "line" -> parseLine(child, sectionYOffset, frame)?.let(out::add)
                "rectangle" -> parseRectangle(child, sectionYOffset, frame)?.let(out::add)
                "image" -> parseImage(child, sectionYOffset, frame)?.let(out::add)
                "componentElement" -> parseComponentElement(child, sectionYOffset, options, frame)?.let(out::addAll)
                "frame" -> parseFrame(child, sectionYOffset, options)?.let(out::addAll)
                // "subreport" -> parseSubReport(child, sectionYOffset, options)?.let(out::addAll)
                else -> {
                    if (options.failOnUnsupportedElement) {
                        throw JasperTemplateConversionException("Elemento Jasper não suportado: <${child.tagName}>")
                    }
                }
            }
        }

        return out
    }

    private fun parseStaticText(
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): StaticTextElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val textValue = node.firstDirectChild("text")?.textContent?.trim().orEmpty()
        if (textValue.isBlank()) return null

        return StaticTextElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            value = textValue,
            style = parseTextStyle(node),
        )
    }

    private fun parseTextField(
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): TextElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        var expression = node.firstDirectChild("textFieldExpression")?.textContent?.trim().orEmpty()
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        if (expression.matches(Regex("^\".*\"$"))) {
            expression = expression.substring(1, expression.length - 1)
        }

        return TextElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            dataBinding = dataBinding,
            value = if (dataBinding == null) expression else null,
            style = parseTextStyle(node),
            printCondition = condition,
        )
    }

    private fun parseLine(
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): LineElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val pen = node.firstDirectChild("graphicElement")?.firstDirectChild("pen")

        return LineElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 0).toFloat(),
            style =
                LineStyle(
                    color = pen?.getAttribute("lineColor")?.ifBlank { null } ?: "#000000",
                    width = pen?.getAttribute("lineWidth")?.toFloatOrNull() ?: 1f,
                ),
        )
    }

    private fun parseRectangle(
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): RectangleElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val pen = node.firstDirectChild("graphicElement")?.firstDirectChild("pen")

        val radius = node.getIntAttribute("radius", 0).toFloat()
        return RectangleElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 100).toFloat(),
            style =
                RectangleStyle(
                    borderColor = pen?.getAttribute("lineColor")?.ifBlank { null },
                    borderWidth = pen?.getAttribute("lineWidth")?.toFloatOrNull() ?: 0f,
                    fillColor = reportElement.getAttribute("backcolor").ifBlank { null },
                    cornerRadius = radius,
                ),
        )
    }

    private fun parseImage(
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): ImageElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val expression = node.firstDirectChild("imageExpression")?.textContent?.trim().orEmpty()
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)

        return ImageElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 120).toFloat(),
            height = reportElement.getIntAttribute("height", 80).toFloat(),
            dataBinding = dataBinding,
            source = if (dataBinding == null) expression.trim('"') else null,
            fit = "contain",
            alignment = "center",
        )
    }

    private fun parseTextStyle(node: Element): TextStyle {
        val textElement = node.firstDirectChild("textElement")
        val font = textElement?.firstDirectChild("font")

        val isBold = font?.getAttribute("isBold")?.toBooleanStrictOrNull() ?: false
        val isItalic = font?.getAttribute("isItalic")?.toBooleanStrictOrNull() ?: false

        return TextStyle(
            fontSize = font?.getAttribute("size")?.toFloatOrNull() ?: 12f,
            fontFamily = font?.getAttribute("fontName")?.ifBlank { "Helvetica" } ?: "Helvetica",
            fontWeight = if (isBold) "bold" else "normal",
            fontStyle = if (isItalic) "italic" else "normal",
            alignment = textElement?.getAttribute("textAlignment")?.ifBlank { "left" }?.lowercase() ?: "left",
            verticalAlignment = textElement?.getAttribute("verticalAlignment")?.ifBlank { "center" }?.lowercase() ?: "center",
        )
    }

    private fun Element.getIntAttribute(
        name: String,
        default: Int,
    ): Int =
        getAttribute(name)
            .toIntOrNull()
            ?: default

    private fun Element.firstDirectChild(tag: String): Element? {
        val children = childNodes
        for (idx in 0 until children.length) {
            val child = children.item(idx)
            if (child is Element && child.tagName == tag) {
                return child
            }
        }
        return null
    }
}
