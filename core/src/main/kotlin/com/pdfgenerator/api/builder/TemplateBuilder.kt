package com.pdfgenerator.api.builder

import com.pdfgenerator.model.*

class TemplateBuilder {
    private var version: String = "1.0"
    private var metadata: TemplateMetadata = TemplateMetadata()
    private var pageSize: String = "A4"
    private var orientation: String = "portrait"
    private var margins: Margins = Margins(30f, 30f, 30f, 30f)
    private var customSize: CustomSize? = null
    private val elements = mutableListOf<Element>()

    fun version(version: String) = apply { this.version = version }

    fun metadata(block: MetadataBuilder.() -> Unit) = apply {
        this.metadata = MetadataBuilder().apply(block).build()
    }

    fun pageSize(size: String) = apply { this.pageSize = size }

    fun orientation(orientation: String) = apply { this.orientation = orientation }

    fun margins(top: Float, right: Float, bottom: Float, left: Float) = apply {
        this.margins = Margins(top, right, bottom, left)
    }

    fun customSize(width: Float, height: Float) = apply {
        this.pageSize = "CUSTOM"
        this.customSize = CustomSize(width, height)
    }

    fun addText(block: TextElementBuilder.() -> Unit) = apply {
        elements.add(TextElementBuilder().apply(block).build())
    }

    fun addImage(block: ImageElementBuilder.() -> Unit) = apply {
        elements.add(ImageElementBuilder().apply(block).build())
    }

    fun addTable(block: TableElementBuilder.() -> Unit) = apply {
        elements.add(TableElementBuilder().apply(block).build())
    }

    fun addRectangle(block: RectangleElementBuilder.() -> Unit) = apply {
        elements.add(RectangleElementBuilder().apply(block).build())
    }

    fun addLine(block: LineElementBuilder.() -> Unit) = apply {
        elements.add(LineElementBuilder().apply(block).build())
    }

    fun addBarcode(block: BarcodeElementBuilder.() -> Unit) = apply {
        elements.add(BarcodeElementBuilder().apply(block).build())
    }

    fun build(): Template {
        val pageSettings = PageSettings(
            size = pageSize,
            orientation = orientation,
            margins = margins,
            customSize = customSize
        )

        return Template(
            version = version,
            metadata = metadata,
            pageSettings = pageSettings,
            pageElements = elements
        )
    }
}

class MetadataBuilder {
    var name: String = ""
    var description: String = ""
    var author: String = ""
    var created: String = ""
    var modified: String = ""
    var tags: List<String> = emptyList()

    fun build() = TemplateMetadata(name, description, author, created, modified, tags)
}

class TextElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Float? = null
    var height: Float? = null
    var dataBinding: String? = null
    var value: String? = null
    var fontSize: Float = 12f
    var fontFamily: String = "Helvetica"
    var fontWeight: String = "normal"
    var fontStyle: String = "normal"
    var color: String = "#000000"
    var alignment: String = "left"
    var verticalAlignment: String = "center"
    var lineHeight: Float = 1.5f
    var multiline: Boolean = false
    var firstLineIndent: Float = 0f

    fun build() = TextElement(
        id = id,
        x = x,
        y = y,
        width = width,
        height = height,
        dataBinding = dataBinding,
        value = value,
        style = TextStyle(fontSize, fontFamily, fontWeight, fontStyle, color, null, alignment, verticalAlignment, lineHeight, multiline, firstLineIndent, 0f, 0f, 0f, 0f)
    )
}

class ImageElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Float = 100f
    var height: Float = 100f
    var dataBinding: String? = null
    var source: String? = null
    var fit: String = "contain"
    var alignment: String = "center"

    fun build() = ImageElement(id = id, x = x, y = y, width = width, height = height,
        dataBinding = dataBinding, source = source, fit = fit, alignment = alignment)
}

class TableElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Float? = null
    var dataBinding: String = ""
    private val columns = mutableListOf<TableColumn>()
    var style: TableStyle? = null

    fun column(header: String, field: String, width: Float? = null, alignment: String = "left", format: String = "text") {
        columns.add(TableColumn(header, field, width, alignment, format = format))
    }

    fun build() = TableElement(id = id, x = x, y = y, width = width,
        dataBinding = dataBinding, columns = columns, style = style)
}

class RectangleElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Float = 100f
    var height: Float = 100f
    var fillColor: String? = null
    var borderColor: String? = null
    var borderWidth: Float = 1f
    var cornerRadius: Float = 0f

    fun build() = RectangleElement(id = id, x = x, y = y, width = width, height = height,
        style = RectangleStyle(fillColor, borderColor, borderWidth, cornerRadius))
}

class LineElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Any = 100f  // Can be Float or String ("100%")
    var height: Any = 0f   // Can be Float or String ("100%")
    var color: String = "#000000"
    var strokeWidth: Float = 1f
    var dashPattern: List<Float>? = null

    fun build() = LineElement(id = id, x = x, y = y, width = width, height = height,
        style = LineStyle(color = color, width = strokeWidth, dashPattern = dashPattern))
}

class BarcodeElementBuilder {
    var id: String = ""
    var x: Float = 0f
    var y: Float = 0f
    var width: Float = 100f
    var height: Float = 100f
    var barcodeType: String = "qrcode"
    var dataBinding: String = ""
    var errorCorrection: String = "M"

    fun build() = BarcodeElement(
        id = id,
        x = x,
        y = y,
        width = width,
        height = height,
        barcodeType = barcodeType,
        dataBinding = dataBinding,
        style = BarcodeStyle(errorCorrection)
    )
}

