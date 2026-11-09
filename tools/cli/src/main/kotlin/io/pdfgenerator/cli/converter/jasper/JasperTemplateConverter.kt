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
import com.pdfgenerator.model.TableColumn
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
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
@Suppress("LargeClass")
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
        val file = File(path)
        val effectiveOptions =
            if (options.baseDir == null && file.parentFile != null) {
                options.copy(baseDir = file.parentFile)
            } else {
                options
            }
        val document = buildDocument(file.inputStream())
        return convertDocument(document, effectiveOptions)
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

    data class JasperStyle(
        val name: String = "",
        val parentStyleName: String? = null,
        val isDefault: Boolean = false,
        val fontName: String? = null,
        val fontSize: Float? = null,
        val isBold: Boolean? = null,
        val isItalic: Boolean? = null,
        val forecolor: String? = null,
        val backcolor: String? = null,
        val alignment: String? = null,
        val verticalAlignment: String? = null,
    )

    private data class ConversionContext(
        val options: JasperConversionOptions,
        val stylesMap: Map<String, JasperStyle> = emptyMap(),
        val defaultStyle: JasperStyle? = null,
    )

    private fun parseJasperStyle(elem: Element): JasperStyle {
        val fontNode = elem.firstDirectChild("font")
        val fontName =
            elem.getAttribute("fontName").ifBlank { null }
                ?: fontNode?.getAttribute("fontName")?.ifBlank { null }
        val fontSize =
            elem.getAttribute("fontSize").toFloatOrNull()
                ?: elem.getAttribute("size").toFloatOrNull()
                ?: fontNode?.getAttribute("size")?.toFloatOrNull()
        val isBold =
            elem.getAttribute("isBold").toBooleanStrictOrNull()
                ?: fontNode?.getAttribute("isBold")?.toBooleanStrictOrNull()
        val isItalic =
            elem.getAttribute("isItalic").toBooleanStrictOrNull()
                ?: fontNode?.getAttribute("isItalic")?.toBooleanStrictOrNull()
        val forecolor = elem.getAttribute("forecolor").ifBlank { null }
        val backcolor = elem.getAttribute("backcolor").ifBlank { null }

        val alignRaw =
            elem.getAttribute("hTextAlign").ifBlank { null }
                ?: elem.getAttribute("hAlign").ifBlank { null }
                ?: elem.getAttribute("textAlignment").ifBlank { null }
        val vAlignRaw =
            elem.getAttribute("vTextAlign").ifBlank { null }
                ?: elem.getAttribute("vAlign").ifBlank { null }
                ?: elem.getAttribute("verticalAlignment").ifBlank { null }

        val alignment =
            when (alignRaw?.lowercase()) {
                "right" -> "right"
                "center" -> "center"
                "justify", "justified" -> "justify"
                "left" -> "left"
                else -> null
            }
        val verticalAlignment =
            when (vAlignRaw?.lowercase()) {
                "middle", "center" -> "center"
                "bottom" -> "bottom"
                "top" -> "top"
                else -> null
            }

        return JasperStyle(
            name = elem.getAttribute("name").trim(),
            parentStyleName = elem.getAttribute("style").ifBlank { null },
            isDefault = elem.getAttribute("isDefault").toBooleanStrictOrNull() ?: false,
            fontName = fontName,
            fontSize = fontSize,
            isBold = isBold,
            isItalic = isItalic,
            forecolor = forecolor,
            backcolor = backcolor,
            alignment = alignment,
            verticalAlignment = verticalAlignment,
        )
    }

    private fun resolveStyle(
        styleName: String?,
        stylesMap: Map<String, JasperStyle>,
        defaultStyle: JasperStyle?,
    ): JasperStyle {
        val chain = mutableListOf<JasperStyle>()
        if (defaultStyle != null) {
            chain.add(defaultStyle)
        }

        if (!styleName.isNullOrBlank()) {
            val visited = mutableSetOf<String>()
            var currentName: String? = styleName
            val namedChain = mutableListOf<JasperStyle>()
            while (!currentName.isNullOrBlank() && currentName !in visited) {
                visited.add(currentName)
                val s = stylesMap[currentName] ?: break
                namedChain.add(s)
                currentName = s.parentStyleName
            }
            namedChain.reverse()
            chain.addAll(namedChain)
        }

        var merged = JasperStyle()
        for (s in chain) {
            merged =
                merged.copy(
                    fontName = s.fontName ?: merged.fontName,
                    fontSize = s.fontSize ?: merged.fontSize,
                    isBold = s.isBold ?: merged.isBold,
                    isItalic = s.isItalic ?: merged.isItalic,
                    forecolor = s.forecolor ?: merged.forecolor,
                    backcolor = s.backcolor ?: merged.backcolor,
                    alignment = s.alignment ?: merged.alignment,
                    verticalAlignment = s.verticalAlignment ?: merged.verticalAlignment,
                )
        }
        return merged
    }

    private fun convertSection(
        sectionNodes: NodeList,
        offset: Float,
        maxWidth: Float,
        context: ConversionContext,
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
                        elements.addAll(parseBandElements(bandNode, yOffset, context, null))
                        yOffset += bandHeight
                    }
                } else {
                    for (bandIdx in 0 until bands.length) {
                        val bandNode = bands.item(bandIdx)
                        if (bandNode is Element) {
                            val bandHeight = bandNode.getIntAttribute("height", 0).toFloat()
                            elements.add(parseBand(bandNode, yOffset, maxWidth, context, null))
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

        val styleNodes = root.getElementsByTagName("style")
        val stylesMap = mutableMapOf<String, JasperStyle>()
        var defaultStyle: JasperStyle? = null

        for (i in 0 until styleNodes.length) {
            val styleElem = styleNodes.item(i)
            if (styleElem is Element) {
                val style = parseJasperStyle(styleElem)
                if (style.name.isNotBlank()) {
                    stylesMap[style.name] = style
                }
                if (style.isDefault) {
                    defaultStyle = style
                }
            }
        }

        val context =
            ConversionContext(
                options = options,
                stylesMap = stylesMap,
                defaultStyle = defaultStyle,
            )

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

        val elements = mutableListOf<com.pdfgenerator.model.Element>()
        var summaryElem: List<com.pdfgenerator.model.Element>? = null
        var yOffset = 0f

        // 1. Background
        val backgroundNodes = root.getElementsByTagName("background")
        if (backgroundNodes.length > 0) {
            val sectionElements = convertSection(backgroundNodes, 0f, containerWidth, context)
            val out = sectionElements["elements"] as List<com.pdfgenerator.model.Element>
            if (out.isNotEmpty()) {
                pageSettings = pageSettings.copy(bodyBackground = BodyBackground(out))
            }
        }

        // 2. PageHeader
        val pageHeaderNodes = root.getElementsByTagName("pageHeader")
        if (pageHeaderNodes.length > 0) {
            val sectionElements = convertSection(pageHeaderNodes, 0f, containerWidth, context)
            val out = sectionElements["elements"] as List<com.pdfgenerator.model.Element>
            if (out.isNotEmpty()) {
                pageSettings =
                    pageSettings.copy(header = HeaderFooter(sectionElements["height"] as Float, out))
            }
        }

        // 3. PageFooter
        val pageFooterNodes = root.getElementsByTagName("pageFooter")
        if (pageFooterNodes.length > 0) {
            val sectionElements = convertSection(pageFooterNodes, 0f, containerWidth, context)
            val out = sectionElements["elements"] as List<com.pdfgenerator.model.Element>
            if (out.isNotEmpty()) {
                pageSettings =
                    pageSettings.copy(footer = HeaderFooter(sectionElements["height"] as Float, out))
            }
        }

        // 4. Title
        val titleNodes = root.getElementsByTagName("title")
        if (titleNodes.length > 0) {
            val sectionElements = convertSection(titleNodes, 0f, containerWidth, context)
            val out = sectionElements["elements"] as List<com.pdfgenerator.model.Element>
            if (out.isNotEmpty()) {
                yOffset = sectionElements["height"] as Float
                elements.addAll(out)
            }
        }

        // 5. ColumnHeader and Detail
        val columnHeaderNodes = root.getElementsByTagName("columnHeader")
        val detailNodes = root.getElementsByTagName("detail")

        val tableInference = tryInferTable(columnHeaderNodes, detailNodes, yOffset, containerWidth, context)
        if (tableInference != null) {
            elements.add(tableInference.first)
            yOffset = tableInference.second
        } else {
            if (columnHeaderNodes.length > 0) {
                val chSection = convertSection(columnHeaderNodes, yOffset, containerWidth, context)
                val chElements = chSection["elements"] as List<com.pdfgenerator.model.Element>
                if (chElements.isNotEmpty()) {
                    elements.addAll(chElements)
                }
                yOffset = chSection["height"] as Float
            }

            if (detailNodes.length > 0) {
                if (columnHeaderNodes.length > 0 || options.wrapDetailInLoop) {
                    val loopResult = convertDetailToLoop(detailNodes, yOffset, containerWidth, context)
                    elements.add(loopResult.first)
                    yOffset = loopResult.second
                } else {
                    val dSection = convertSection(detailNodes, yOffset, containerWidth, context)
                    val dElements = dSection["elements"] as List<com.pdfgenerator.model.Element>
                    if (dElements.isNotEmpty()) {
                        elements.addAll(dElements)
                    }
                    yOffset = dSection["height"] as Float
                }
            }
        }

        // 6. ColumnFooter
        val columnFooterNodes = root.getElementsByTagName("columnFooter")
        if (columnFooterNodes.length > 0) {
            val cfSection = convertSection(columnFooterNodes, yOffset, containerWidth, context)
            val cfElements = cfSection["elements"] as List<com.pdfgenerator.model.Element>
            if (cfElements.isNotEmpty()) {
                elements.addAll(cfElements)
            }
            yOffset = cfSection["height"] as Float
        }

        val isSummaryNewPage = root.getAttribute("isSummaryNewPage").equals("true", ignoreCase = true)

        // 7. Summary
        val summaryNodes = root.getElementsByTagName("summary")
        if (summaryNodes.length > 0) {
            if (isSummaryNewPage) {
                val sSection = convertSection(summaryNodes, 0f, containerWidth, context)
                val sElements = sSection["elements"] as List<com.pdfgenerator.model.Element>
                if (sElements.isNotEmpty()) {
                    summaryElem = sElements
                }
            } else {
                // When isSummaryNewPage is false (Jasper default), summary renders on the same page
                val sSection = convertSection(summaryNodes, yOffset, containerWidth, context)
                val sElements = sSection["elements"] as List<com.pdfgenerator.model.Element>
                if (sElements.isNotEmpty()) {
                    elements.addAll(sElements)
                    yOffset = sSection["height"] as Float
                }
            }
        }

        return Template(
            version = "1.0",
            metadata = metadata,
            pageSettings = pageSettings,
            page = elements,
            pageElements = elements,
            summaryPage = summaryElem?.let { SummaryPage(summaryElem) },
        )
    }

    private data class CandidateHeader(
        val x: Float,
        val y: Float,
        val width: Float,
        val height: Float,
        val text: String,
        val alignment: String,
        val forecolor: String?,
        val fontSize: Float?,
    )

    private data class CandidateField(
        val x: Float,
        val y: Float,
        val width: Float,
        val height: Float,
        val field: String,
        val alignment: String,
        val forecolor: String?,
        val fontSize: Float?,
    )

    private fun getBands(sectionNodes: NodeList): List<Element> {
        val bands = mutableListOf<Element>()
        for (i in 0 until sectionNodes.length) {
            val node = sectionNodes.item(i)
            if (node is Element) {
                val bandNodes = node.getElementsByTagName("band")
                for (j in 0 until bandNodes.length) {
                    val band = bandNodes.item(j)
                    if (band is Element) {
                        bands.add(band)
                    }
                }
            }
        }
        return bands
    }

    private fun tryInferTable(
        columnHeaderNodes: NodeList,
        detailNodes: NodeList,
        currentY: Float,
        containerWidth: Float,
        context: ConversionContext,
    ): Pair<TableElement, Float>? {
        if (!context.options.enableTableInference) return null
        if (columnHeaderNodes.length == 0 || detailNodes.length == 0) return null

        val headerBands = getBands(columnHeaderNodes)
        val detailBands = getBands(detailNodes)
        if (headerBands.size != 1 || detailBands.size != 1) return null

        val headerBand = headerBands[0]
        val detailBand = detailBands[0]

        val headers = extractCandidateHeaders(headerBand, context)
        val fields = extractCandidateFields(detailBand, context) ?: return null

        if (headers.isEmpty() || fields.isEmpty()) return null
        if (headers.size != fields.size) return null

        val minY = fields.minOf { it.y }
        val maxY = fields.maxOf { it.y }
        if (maxY - minY > 15f) return null

        for (i in headers.indices) {
            val h = headers[i]
            val f = fields[i]
            if (kotlin.math.abs(h.x - f.x) > 30f) return null
        }

        val rectList = headerBand.getElementsByTagName("rectangle")
        val rect = if (rectList.length > 0) rectList.item(0) as? Element else null
        val rectReportElem = rect?.firstDirectChild("reportElement")
        val headerBg =
            rectReportElem?.getAttribute("backcolor")?.ifBlank { null }
                ?: rect?.getAttribute("backcolor")?.ifBlank { null }
                ?: rect?.getAttribute("fillColor")?.ifBlank { null }
                ?: "#f8fafc"
        val pen = rect?.firstDirectChild("graphicElement")?.firstDirectChild("pen")
        val borderColor =
            pen?.getAttribute("lineColor")?.ifBlank { null }
                ?: rectReportElem?.getAttribute("forecolor")?.ifBlank { null }
                ?: rect?.getAttribute("forecolor")?.ifBlank { null }
                ?: "#e2e8f0"

        val detailLines = detailBand.getElementsByTagName("line")
        val finalBorderColor =
            if (detailLines.length > 0) {
                val lineElem = detailLines.item(0) as? Element
                val lineReport = lineElem?.firstDirectChild("reportElement")
                val linePen = lineElem?.firstDirectChild("graphicElement")?.firstDirectChild("pen")
                linePen?.getAttribute("lineColor")?.ifBlank { null }
                    ?: lineReport?.getAttribute("forecolor")?.ifBlank { null }
                    ?: lineElem?.getAttribute("forecolor")?.ifBlank { null }
                    ?: borderColor
            } else {
                borderColor
            }

        val headerTextColor = headers.firstOrNull { it.forecolor != null }?.forecolor ?: "#0f172a"
        val headerFontSize = headers.firstOrNull()?.fontSize ?: 9f
        val rowTextColor = fields.firstOrNull { it.forecolor != null }?.forecolor ?: "#1e293b"
        val rowFontSize = fields.firstOrNull()?.fontSize ?: 8f

        val tableX = rectReportElem?.getIntAttribute("x", 0)?.toFloat() ?: 0f
        val tableWidth = rectReportElem?.getIntAttribute("width", containerWidth.toInt())?.toFloat() ?: containerWidth

        val columns =
            headers.zip(fields).map { (h, f) ->
                TableColumn(
                    header = h.text,
                    field = f.field,
                    width = h.width,
                    alignment = f.alignment,
                    headerAlignment = h.alignment,
                    format = "text",
                )
            }

        val table =
            TableElement(
                id = UUID.randomUUID().toString(),
                x = tableX,
                y = currentY,
                width = tableWidth,
                dataBinding = context.options.defaultItemsBinding,
                columns = columns,
                style =
                    TableStyle(
                        headerBackground = headerBg,
                        headerColor = headerTextColor,
                        headerTextColor = headerTextColor,
                        headerFontSize = headerFontSize,
                        rowColor = rowTextColor,
                        fontSize = rowFontSize,
                        borderColor = finalBorderColor,
                    ),
            )

        val headerHeight = headerBand.getIntAttribute("height", 24).toFloat()
        val detailHeight = detailBand.getIntAttribute("height", 20).toFloat()
        return Pair(table, currentY + headerHeight + detailHeight)
    }

    private fun extractCandidateHeaders(
        band: Element,
        context: ConversionContext,
    ): List<CandidateHeader> {
        val list = mutableListOf<CandidateHeader>()
        collectCandidateHeaders(band, 0f, 0f, context, list)
        return list.sortedBy { it.x }
    }

    @Suppress("LoopWithTooManyJumpStatements")
    private fun collectCandidateHeaders(
        parent: Element,
        offsetX: Float,
        offsetY: Float,
        context: ConversionContext,
        list: MutableList<CandidateHeader>,
    ) {
        val children = parent.childNodes
        for (i in 0 until children.length) {
            val child = children.item(i)
            if (child !is Element) continue
            val reportElement = child.firstDirectChild("reportElement")
            val styleName =
                child.getAttribute("style").ifBlank { null }
                    ?: reportElement?.getAttribute("style")?.ifBlank { null }
            val resolved = resolveStyle(styleName, context.stylesMap, context.defaultStyle)

            when (child.tagName) {
                "staticText" -> {
                    if (reportElement == null) continue
                    val text = child.firstDirectChild("text")?.textContent?.trim().orEmpty()
                    if (text.isBlank()) continue
                    val textElement = child.firstDirectChild("textElement")
                    val font = textElement?.firstDirectChild("font")
                    val forecolor = reportElement.getAttribute("forecolor").ifBlank { null } ?: resolved.forecolor
                    val fontSize = font?.getAttribute("size")?.toFloatOrNull() ?: resolved.fontSize ?: 9f
                    val alignment =
                        textElement?.getAttribute(
                            "textAlignment",
                        )?.ifBlank { null }?.lowercase() ?: resolved.alignment ?: "left"

                    list.add(
                        CandidateHeader(
                            x = reportElement.getIntAttribute("x", 0).toFloat() + offsetX,
                            y = reportElement.getIntAttribute("y", 0).toFloat() + offsetY,
                            width = reportElement.getIntAttribute("width", 50).toFloat(),
                            height = reportElement.getIntAttribute("height", 16).toFloat(),
                            text = text,
                            alignment = alignment,
                            forecolor = forecolor,
                            fontSize = fontSize,
                        ),
                    )
                }
                "textField" -> {
                    if (reportElement == null) continue
                    val expr = child.firstDirectChild("textFieldExpression")?.textContent?.trim().orEmpty()
                    if (expr.startsWith("\"") && expr.endsWith("\"")) {
                        val text = expr.removeSurrounding("\"")
                        if (text.isNotBlank()) {
                            val textElement = child.firstDirectChild("textElement")
                            val font = textElement?.firstDirectChild("font")
                            val forecolor = reportElement.getAttribute("forecolor").ifBlank { null } ?: resolved.forecolor
                            val fontSize = font?.getAttribute("size")?.toFloatOrNull() ?: resolved.fontSize ?: 9f
                            val alignment =
                                textElement?.getAttribute(
                                    "textAlignment",
                                )?.ifBlank { null }?.lowercase() ?: resolved.alignment ?: "left"

                            list.add(
                                CandidateHeader(
                                    x = reportElement.getIntAttribute("x", 0).toFloat() + offsetX,
                                    y = reportElement.getIntAttribute("y", 0).toFloat() + offsetY,
                                    width = reportElement.getIntAttribute("width", 50).toFloat(),
                                    height = reportElement.getIntAttribute("height", 16).toFloat(),
                                    text = text,
                                    alignment = alignment,
                                    forecolor = forecolor,
                                    fontSize = fontSize,
                                ),
                            )
                        }
                    }
                }
                "frame" -> {
                    val fx = reportElement?.getIntAttribute("x", 0)?.toFloat() ?: 0f
                    val fy = reportElement?.getIntAttribute("y", 0)?.toFloat() ?: 0f
                    collectCandidateHeaders(child, offsetX + fx, offsetY + fy, context, list)
                }
            }
        }
    }

    private fun extractCandidateFields(
        band: Element,
        context: ConversionContext,
    ): List<CandidateField>? {
        val list = mutableListOf<CandidateField>()
        val hasDisqualifiers = collectCandidateFields(band, 0f, 0f, context, list)
        if (hasDisqualifiers) return null
        return list.sortedBy { it.x }
    }

    @Suppress("LoopWithTooManyJumpStatements")
    private fun collectCandidateFields(
        parent: Element,
        offsetX: Float,
        offsetY: Float,
        context: ConversionContext,
        list: MutableList<CandidateField>,
    ): Boolean {
        val children = parent.childNodes
        for (i in 0 until children.length) {
            val child = children.item(i)
            if (child !is Element) continue
            val reportElement = child.firstDirectChild("reportElement")
            val styleName =
                child.getAttribute("style").ifBlank { null }
                    ?: reportElement?.getAttribute("style")?.ifBlank { null }
            val resolved = resolveStyle(styleName, context.stylesMap, context.defaultStyle)

            when (child.tagName) {
                "image", "componentElement", "subreport" -> return true
                "textField" -> {
                    if (reportElement == null) continue
                    val expr = child.firstDirectChild("textFieldExpression")?.textContent?.trim().orEmpty()
                    val dataBinding = JasperExpressionMapper.toDataBinding(expr)
                    val rawPattern = child.getAttribute("pattern").ifBlank { null }
                    val formattedBinding = JasperExpressionMapper.applyPattern(dataBinding, rawPattern)
                    val fieldName =
                        formattedBinding
                            ?: if (expr.startsWith("\"") && expr.endsWith("\"")) expr.removeSurrounding("\"") else expr
                    if (fieldName.isBlank()) continue
                    val textElement = child.firstDirectChild("textElement")
                    val font = textElement?.firstDirectChild("font")
                    val forecolor = reportElement.getAttribute("forecolor").ifBlank { null } ?: resolved.forecolor
                    val fontSize = font?.getAttribute("size")?.toFloatOrNull() ?: resolved.fontSize ?: 9f
                    val alignment =
                        textElement?.getAttribute(
                            "textAlignment",
                        )?.ifBlank { null }?.lowercase() ?: resolved.alignment ?: "left"

                    list.add(
                        CandidateField(
                            x = reportElement.getIntAttribute("x", 0).toFloat() + offsetX,
                            y = reportElement.getIntAttribute("y", 0).toFloat() + offsetY,
                            width = reportElement.getIntAttribute("width", 50).toFloat(),
                            height = reportElement.getIntAttribute("height", 16).toFloat(),
                            field = fieldName,
                            alignment = alignment,
                            forecolor = forecolor,
                            fontSize = fontSize,
                        ),
                    )
                }
                "frame" -> {
                    val fx = reportElement?.getIntAttribute("x", 0)?.toFloat() ?: 0f
                    val fy = reportElement?.getIntAttribute("y", 0)?.toFloat() ?: 0f
                    val disqualified = collectCandidateFields(child, offsetX + fx, offsetY + fy, context, list)
                    if (disqualified) return true
                }
            }
        }
        return false
    }

    private fun convertDetailToLoop(
        detailNodes: NodeList,
        yOffset: Float,
        containerWidth: Float,
        context: ConversionContext,
    ): Pair<LoopElement, Float> {
        val loopElements = mutableListOf<com.pdfgenerator.model.Element>()
        var totalHeight = 0f
        var currentRelY = 0f

        for (sectionIdx in 0 until detailNodes.length) {
            val sectionNode = detailNodes.item(sectionIdx)
            if (sectionNode is Element) {
                val bands = sectionNode.getElementsByTagName("band")
                for (bandIdx in 0 until bands.length) {
                    val bandNode = bands.item(bandIdx)
                    if (bandNode is Element) {
                        val bandHeight = bandNode.getIntAttribute("height", 0).toFloat()
                        loopElements.addAll(parseBandElements(bandNode, currentRelY, context, null))
                        currentRelY += bandHeight
                        totalHeight += bandHeight
                    }
                }
            }
        }

        val loop =
            LoopElement(
                type = "loop",
                id = UUID.randomUUID().toString(),
                x = 0f,
                y = yOffset,
                width = containerWidth,
                height = if (totalHeight > 0f) totalHeight else 50f,
                dataBinding = context.options.defaultItemsBinding,
                elements = loopElements,
            )

        return Pair(loop, yOffset + totalHeight)
    }

    private fun parseComponentElement(
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
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
                "jr:Code128", "jr:code128" -> parseJrCode128(reportElement, child, sectionYOffset, frame)?.let(out::add)
                "jr:list" -> parseJrList(reportElement, child, sectionYOffset, context, frame)?.let(out::add)
            }
        }
        return out
    }

    private fun parseJrList(
        reportElement: Element,
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): LoopElement? {
        var expression = node.firstDirectChild("datasetRun")?.textContent?.trim().orEmpty()
        val content = node.firstDirectChild("jr:listContents")
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val out = parseBandElements(content!!, 0f, context, frame)

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
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): ContainerElement {
        val out = parseBandElements(node, 0f, context, frame)

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
        val expression =
            node.firstDirectChild("jr:QRCode")?.textContent?.trim()?.ifBlank { null }
                ?: node.textContent?.trim().orEmpty()
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        return BarcodeElement(
            type = "barcode",
            barcodeType = "qr_code",
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            dataBinding = dataBinding ?: "",
            value = if (dataBinding == null && expression.isNotBlank()) expression.trim('"') else null,
            printCondition = condition,
        )
    }

    private fun parseJrCode128(
        reportElement: Element,
        node: Element,
        sectionYOffset: Float,
        frame: Map<String, Float>?,
    ): BarcodeElement? {
        val expression =
            node.firstDirectChild("jr:codeExpression")?.textContent?.trim()?.ifBlank { null }
                ?: node.textContent?.trim().orEmpty()
        val dataBinding = JasperExpressionMapper.toDataBinding(expression)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        return BarcodeElement(
            type = "barcode",
            barcodeType = "code128",
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 160).toFloat(),
            height = reportElement.getIntAttribute("height", 30).toFloat(),
            dataBinding = dataBinding ?: "",
            value = if (dataBinding == null && expression.isNotBlank()) expression.trim('"') else null,
            printCondition = condition,
        )
    }

    private fun parseFrame(
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
    ): List<com.pdfgenerator.model.Element>? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val x = reportElement.getIntAttribute("x", 0).toFloat()
        val y = reportElement.getIntAttribute("y", 0).toFloat()
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        val out =
            parseBandElements(
                node,
                sectionYOffset,
                context,
                mapOf(
                    "x" to x,
                    "y" to y,
                ),
            ).map { child ->
                if (condition != null) {
                    when (child) {
                        is RectangleElement -> child.copy(printCondition = condition)
                        is TextElement -> child.copy(printCondition = condition)
                        is StaticTextElement ->
                            TextElement(
                                id = child.id,
                                x = child.x,
                                y = child.y,
                                width = child.width,
                                height = child.height,
                                value = child.value,
                                style = child.style,
                                printCondition = condition,
                            )
                        is LineElement -> child.copy(printCondition = condition)
                        is ImageElement -> child.copy(printCondition = condition)
                        is BarcodeElement -> child.copy(printCondition = condition)
                        is ContainerElement -> child.copy(printCondition = condition)
                        else -> child
                    }
                } else {
                    child
                }
            }

        return out
    }

    private fun parseBandElements(
        band: Element,
        sectionYOffset: Float,
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): List<com.pdfgenerator.model.Element> {
        val out = mutableListOf<com.pdfgenerator.model.Element>()

        val children = band.childNodes
        for (idx in 0 until children.length) {
            val child = children.item(idx)
            if (child !is Element) continue

            when (child.tagName) {
                "staticText" -> parseStaticText(child, sectionYOffset, context, frame)?.let(out::add)
                "textField" -> parseTextField(child, sectionYOffset, context, frame)?.let(out::add)
                "line" -> parseLine(child, sectionYOffset, frame)?.let(out::add)
                "rectangle" -> parseRectangle(child, sectionYOffset, frame)?.let(out::add)
                "image" -> parseImage(child, sectionYOffset, frame)?.let(out::add)
                "componentElement" -> parseComponentElement(child, sectionYOffset, context, frame)?.let(out::addAll)
                "frame" -> parseFrame(child, sectionYOffset, context)?.let(out::addAll)
                "subreport" -> parseSubreport(child, sectionYOffset, context, frame)?.let(out::add)
                else -> {
                    if (context.options.failOnUnsupportedElement) {
                        throw JasperTemplateConversionException("Elemento Jasper não suportado: <${child.tagName}>")
                    }
                }
            }
        }

        return out
    }

    private fun extractSubreportFileName(rawExpression: String): String {
        var expr = rawExpression.trim()
        if (expr.isBlank()) return ""

        val quotedMatch = Regex("\"([^\"]+)\"").findAll(expr).lastOrNull()
        if (quotedMatch != null) {
            expr = quotedMatch.groupValues[1]
        } else {
            expr = expr.trim('"', '\'')
        }

        if (expr.endsWith(".jasper", ignoreCase = true)) {
            expr = expr.substring(0, expr.length - 7) + ".jrxml"
        } else if (!expr.endsWith(".jrxml", ignoreCase = true)) {
            expr += ".jrxml"
        }

        return File(expr).name
    }

    private fun resolveSubreportFile(
        fileName: String,
        baseDir: File?,
    ): File? {
        if (fileName.isBlank()) return null
        if (baseDir != null) {
            val candidate = File(baseDir, fileName)
            if (candidate.exists()) return candidate
        }
        val candidateCwd = File(fileName)
        if (candidateCwd.exists()) return candidateCwd
        return null
    }

    private fun parseSubreport(
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): ContainerElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val subExpr = node.firstDirectChild("subreportExpression")?.textContent?.trim().orEmpty()
        val dataExpr = node.firstDirectChild("dataSourceExpression")?.textContent?.trim().orEmpty()
        val embeddedBinding = Regex("\\\$[FP]\\{([A-Za-z0-9_.]+)}").find(dataExpr)?.groupValues?.get(1)
        val listBinding = JasperExpressionMapper.toDataBinding(dataExpr) ?: embeddedBinding

        val fileName = extractSubreportFileName(subExpr)
        val subreportFile = resolveSubreportFile(fileName, context.options.baseDir)

        val subElements =
            if (subreportFile != null && subreportFile.exists()) {
                try {
                    val subOptions =
                        context.options.copy(
                            defaultItemsBinding = listBinding ?: context.options.defaultItemsBinding,
                            baseDir = subreportFile.parentFile,
                        )
                    val subTemplate = fromFile(subreportFile.absolutePath, subOptions)
                    subTemplate.pageElements ?: emptyList()
                } catch (e: Exception) {
                    System.err.println("Aviso: Falha ao converter subreport '${subreportFile.name}': ${e.message}")
                    emptyList()
                }
            } else {
                if (fileName.isNotBlank()) {
                    val dirLabel = context.options.baseDir?.absolutePath ?: "diretório atual"
                    System.err.println(
                        "Aviso: Subreport '$fileName' não encontrado em $dirLabel. Container gerado vazio.",
                    )
                }
                emptyList()
            }

        return ContainerElement(
            type = "container",
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 50).toFloat(),
            relativeOffsetY = 0f,
            elements = subElements,
        )
    }

    private fun parseStaticText(
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): StaticTextElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val textValue = node.firstDirectChild("text")?.textContent?.trim().orEmpty()
        if (textValue.isBlank()) return null

        val styleName =
            node.getAttribute("style").ifBlank { null }
                ?: reportElement.getAttribute("style").ifBlank { null }
        val resolvedStyle = resolveStyle(styleName, context.stylesMap, context.defaultStyle)

        return StaticTextElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            value = textValue,
            style = parseTextStyle(node, resolvedStyle),
        )
    }

    private fun parseTextField(
        node: Element,
        sectionYOffset: Float,
        context: ConversionContext,
        frame: Map<String, Float>?,
    ): TextElement? {
        val reportElement = node.firstDirectChild("reportElement") ?: return null
        val rawExpression = node.firstDirectChild("textFieldExpression")?.textContent?.trim().orEmpty()
        val mapped = JasperExpressionMapper.mapExpression(rawExpression)
        val rawPattern = node.getAttribute("pattern").ifBlank { null }
        val effectiveBinding = JasperExpressionMapper.applyPattern(mapped.dataBinding, rawPattern)
        val printCondition = reportElement.firstDirectChild("printWhenExpression")?.textContent?.trim().orEmpty()
        val condition = JasperExpressionMapper.toExpression(printCondition)

        val styleName =
            node.getAttribute("style").ifBlank { null }
                ?: reportElement.getAttribute("style").ifBlank { null }
        val resolvedStyle = resolveStyle(styleName, context.stylesMap, context.defaultStyle)

        return TextElement(
            id = UUID.randomUUID().toString(),
            x = reportElement.getIntAttribute("x", 0).toFloat() + (frame?.get("x") ?: 0f),
            y = reportElement.getIntAttribute("y", 0).toFloat() + (frame?.get("y") ?: 0f) + sectionYOffset,
            width = reportElement.getIntAttribute("width", 100).toFloat(),
            height = reportElement.getIntAttribute("height", 16).toFloat(),
            dataBinding = effectiveBinding,
            value = mapped.value,
            style = parseTextStyle(node, resolvedStyle),
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

    private fun parseTextStyle(
        node: Element,
        resolvedStyle: JasperStyle,
    ): TextStyle {
        val reportElement = node.firstDirectChild("reportElement")
        val textElement = node.firstDirectChild("textElement")
        val font = textElement?.firstDirectChild("font")

        val inlineBold = font?.getAttribute("isBold")?.toBooleanStrictOrNull()
        val inlineItalic = font?.getAttribute("isItalic")?.toBooleanStrictOrNull()
        val isBold = inlineBold ?: resolvedStyle.isBold ?: false
        val isItalic = inlineItalic ?: resolvedStyle.isItalic ?: false

        val inlineFontSize = font?.getAttribute("size")?.toFloatOrNull()
        val inlineFontName = font?.getAttribute("fontName")?.ifBlank { null }
        val inlineColor = reportElement?.getAttribute("forecolor")?.ifBlank { null }
        val inlineAlign = textElement?.getAttribute("textAlignment")?.ifBlank { null }?.lowercase()
        val inlineVAlign = textElement?.getAttribute("verticalAlignment")?.ifBlank { null }?.lowercase()

        return TextStyle(
            fontSize = inlineFontSize ?: resolvedStyle.fontSize ?: 12f,
            fontFamily = inlineFontName ?: resolvedStyle.fontName ?: "Helvetica",
            fontWeight = if (isBold) "bold" else "normal",
            fontStyle = if (isItalic) "italic" else "normal",
            color = inlineColor ?: resolvedStyle.forecolor ?: "#000000",
            backgroundColor = reportElement?.getAttribute("backcolor")?.ifBlank { null } ?: resolvedStyle.backcolor,
            alignment = inlineAlign ?: resolvedStyle.alignment ?: "left",
            verticalAlignment = inlineVAlign ?: resolvedStyle.verticalAlignment ?: "center",
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
