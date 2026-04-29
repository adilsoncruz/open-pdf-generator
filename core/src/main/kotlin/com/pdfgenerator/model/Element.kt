package com.pdfgenerator.model

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

enum class PositionMode {
    ABSOLUTE,
    RELATIVE,
}

sealed interface Element {
    val type: String
    val id: String
    public val x: Float
    public val y: Float
    val positionMode: PositionMode?
    val relativeOffsetY: Float?

    fun validate(pageSettings: PageSettings): List<ValidationError>
}

data class TextElement(
    override val type: String = "text",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float? = null,
    val height: Float? = null,
    val dataBinding: String? = null,
    val value: String? = null,
    val style: TextStyle? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding == null && value == null) {
            errors.add(ValidationError(id, "TextElement deve ter dataBinding ou value"))
        }
        return errors
    }
}

data class StaticTextElement(
    override val type: String = "static_text",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float? = null,
    val height: Float? = null,
    val value: String,
    val style: TextStyle? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (value.isBlank()) {
            errors.add(ValidationError(id, "StaticTextElement must have non-empty value"))
        }
        return errors
    }
}

data class TextStyle(
    val fontSize: Float = 12f,
    val fontFamily: String = "Helvetica",
    val fontWeight: String = "normal",
    val fontStyle: String = "normal",
    val color: String = "#000000",
    val backgroundColor: String? = null,
    val alignment: String = "left",
    val verticalAlignment: String = "center",
    val lineHeight: Float? = null,
    val multiline: Boolean = false,
    val firstLineIndent: Float = 0f,
    val paddingTop: Float = 0f,
    val paddingBottom: Float = 0f,
    val paddingLeft: Float = 0f,
    val paddingRight: Float = 0f,
    val overflow: String = "visible",
)

data class ImageElement(
    override val type: String = "image",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float,
    val height: Float,
    val dataBinding: String? = null,
    val source: String? = null,
    val fit: String? = null,
    val alignment: String? = null,
    val printCondition: String? = null,
) : Element {
    fun getEffectiveFit(): String = fit ?: "contain"

    fun getEffectiveAlignment(): String = alignment ?: "center"

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding == null && source == null) {
            errors.add(ValidationError(id, "ImageElement deve ter dataBinding ou source"))
        }
        return errors
    }
}

data class TableElement(
    override val type: String = "table",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any? = null,
    val dataBinding: String,
    val columns: List<TableColumn>,
    val style: TableStyle? = null,
    val paginated: Boolean? = null,
    val printCondition: String? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return when (width) {
            is Number -> width.toFloat()
            is String -> {
                if (width.endsWith("%")) {
                    val percentage = width.removeSuffix("%").toFloatOrNull() ?: 100f
                    containerWidth * (percentage / 100f)
                } else {
                    width.toFloatOrNull() ?: containerWidth
                }
            }
            null -> containerWidth
            else -> containerWidth
        }
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (columns.isEmpty()) {
            errors.add(ValidationError(id, "TableElement deve ter pelo menos uma coluna"))
        }
        return errors
    }
}

data class TableColumn(
    val header: String,
    val field: String,
    val width: Float? = null,
    val alignment: String = "left",
    val verticalAlignment: String? = null,
    val headerAlignment: String? = null,
    val headerVerticalAlignment: String? = null,
    val format: String? = "text",
)

data class TableStyle(
    val headerBackground: String = "#f0f0f0",
    val headerColor: String = "#000000",
    val headerFontSize: Float = 12f,
    val headerFontFamily: String? = null,
    val headerFontWeight: String = "bold",
    val headerBorderWidth: Float? = null,
    val headerBorderColor: String? = null,
    val headerTopBorderWidth: Float? = null,
    val headerRightBorderWidth: Float? = null,
    val headerBottomBorderWidth: Float? = null,
    val headerLeftBorderWidth: Float? = null,
    val headerBorderType: String? = null,
    val headerPadding: Float? = null,
    val headerPaddingTop: Float? = null,
    val headerPaddingRight: Float? = null,
    val headerPaddingBottom: Float? = null,
    val headerPaddingLeft: Float? = null,
    val rowFontSize: Float? = null,
    val fontSize: Float? = null,
    val fontFamily: String? = null,
    val rowColor: String? = null,
    val cellColor: String? = null,
    val cellBackground: String? = null,
    val alternateRowBackground: String? = null,
    val borderColor: String = "#cccccc",
    val borderWidth: Float = 1f,
    val borderStyle: String? = null,
    val borderTopWidth: Float? = null,
    val borderRightWidth: Float? = null,
    val borderBottomWidth: Float? = null,
    val borderLeftWidth: Float? = null,
    val cellBorderType: String? = null,
    val cellPadding: Float = 5f,
    val cellPaddingTop: Float? = null,
    val cellPaddingRight: Float? = null,
    val cellPaddingBottom: Float? = null,
    val cellPaddingLeft: Float? = null,
) {
    fun getEffectiveCellFontSize(): Float = fontSize ?: rowFontSize ?: 10f

    fun getEffectiveCellColor(): String = cellColor ?: rowColor ?: "#000000"

    fun getEffectiveHeaderTopBorderWidth(): Float = headerTopBorderWidth ?: headerBorderWidth ?: borderTopWidth ?: borderWidth

    fun getEffectiveHeaderRightBorderWidth(): Float = headerRightBorderWidth ?: headerBorderWidth ?: borderRightWidth ?: borderWidth

    fun getEffectiveHeaderBottomBorderWidth(): Float = headerBottomBorderWidth ?: headerBorderWidth ?: borderBottomWidth ?: borderWidth

    fun getEffectiveHeaderLeftBorderWidth(): Float = headerLeftBorderWidth ?: headerBorderWidth ?: borderLeftWidth ?: borderWidth

    fun getEffectiveHeaderBorderColor(): String = headerBorderColor ?: borderColor

    fun getEffectiveHeaderPadding(): Float = headerPadding ?: cellPadding

    fun getEffectiveHeaderPaddingTop(): Float = headerPaddingTop ?: headerPadding ?: cellPaddingTop ?: cellPadding

    fun getEffectiveHeaderPaddingRight(): Float = headerPaddingRight ?: headerPadding ?: cellPaddingRight ?: cellPadding

    fun getEffectiveHeaderPaddingBottom(): Float = headerPaddingBottom ?: headerPadding ?: cellPaddingBottom ?: cellPadding

    fun getEffectiveHeaderPaddingLeft(): Float = headerPaddingLeft ?: headerPadding ?: cellPaddingLeft ?: cellPadding

    fun getEffectiveCellTopBorderWidth(): Float = borderTopWidth ?: borderWidth

    fun getEffectiveCellRightBorderWidth(): Float = borderRightWidth ?: borderWidth

    fun getEffectiveCellBottomBorderWidth(): Float = borderBottomWidth ?: borderWidth

    fun getEffectiveCellLeftBorderWidth(): Float = borderLeftWidth ?: borderWidth

    fun getEffectiveCellPaddingTop(): Float = cellPaddingTop ?: cellPadding

    fun getEffectiveCellPaddingRight(): Float = cellPaddingRight ?: cellPadding

    fun getEffectiveCellPaddingBottom(): Float = cellPaddingBottom ?: cellPadding

    fun getEffectiveCellPaddingLeft(): Float = cellPaddingLeft ?: cellPadding
}

data class RectangleElement(
    override val type: String = "rectangle",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any,
    val height: Any,
    val style: RectangleStyle? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> = emptyList()

    fun resolveWidth(containerWidth: Float): Float {
        return when (width) {
            is Number -> width.toFloat()
            is String -> {
                if (width.endsWith("%")) {
                    val percentage = width.removeSuffix("%").toFloatOrNull() ?: 100f
                    containerWidth * (percentage / 100f)
                } else {
                    width.toFloatOrNull() ?: 100f
                }
            }
            else -> 100f
        }
    }

    fun resolveHeight(containerHeight: Float): Float {
        return when (height) {
            is Number -> height.toFloat()
            is String -> {
                if (height.endsWith("%")) {
                    val percentage = height.removeSuffix("%").toFloatOrNull() ?: 100f
                    containerHeight * (percentage / 100f)
                } else {
                    height.toFloatOrNull() ?: 100f
                }
            }
            else -> 100f
        }
    }
}

data class RectangleStyle(
    val fillColor: String? = null,
    val borderColor: String? = null,
    val borderWidth: Float = 1f,
    val cornerRadius: Float = 0f,
    val penStyle: String? = null,
    val borderStyle: String? = null,
) {
    fun getEffectivePenStyle(): String? = penStyle ?: borderStyle

    fun getEffectiveBorderColor(): String? {
        return borderColor ?: if (borderWidth > 0) "#000000" else null
    }

    fun shouldDrawBorder(): Boolean {
        return borderColor != null || borderWidth > 0
    }
}

data class LineElement(
    override val type: String = "line",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any,
    val height: Any = 0f,
    val style: LineStyle? = null,
    val printCondition: String? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return when (width) {
            is Number -> width.toFloat()
            is String -> {
                if (width.endsWith("%")) {
                    val percentage = width.removeSuffix("%").toFloatOrNull() ?: 100f
                    (containerWidth * percentage) / 100f
                } else {
                    width.toFloatOrNull() ?: 100f
                }
            }
            else -> 100f
        }
    }

    fun resolveHeight(containerHeight: Float): Float {
        return when (height) {
            is Number -> height.toFloat()
            is String -> {
                if (height.endsWith("%")) {
                    val percentage = height.removeSuffix("%").toFloatOrNull() ?: 100f
                    (containerHeight * percentage) / 100f
                } else {
                    height.toFloatOrNull() ?: 0f
                }
            }
            else -> 0f
        }
    }

    fun getEndX(containerWidth: Float = 0f): Float {
        return x + resolveWidth(containerWidth)
    }

    fun getEndY(containerHeight: Float = 0f): Float {
        return y + resolveHeight(containerHeight)
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> = emptyList()
}

data class LineStyle(
    val color: String? = null,
    val width: Float? = null,
    val strokeColor: String? = null,
    val strokeWidth: Float? = null,
    val dashPattern: List<Float>? = null,
    val penStyle: String? = null,
    val borderStyle: String? = null,
) {
    fun getEffectivePenStyle(): String? = penStyle ?: borderStyle

    fun getEffectiveColor(): String = strokeColor ?: color ?: "#000000"

    fun getEffectiveWidth(): Float = strokeWidth ?: width ?: 1f
}

data class BarcodeElement(
    override val type: String = "barcode",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float,
    val height: Float,
    val barcodeType: String = "qrcode",
    val dataBinding: String,
    val style: BarcodeStyle? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding.isBlank()) {
            errors.add(ValidationError(id, "BarcodeElement deve ter dataBinding"))
        }
        val supportedTypes =
            listOf(
                "qrcode", "qr_code",
                "barcode", "code128", "code_128",
                "code39", "code_39",
                "ean13", "ean_13",
                "ean8", "ean_8",
                "upc_a", "upca",
                "upc_e", "upce",
                "pdf417",
                "datamatrix", "data_matrix",
            )
        if (barcodeType.lowercase() !in supportedTypes) {
            errors.add(
                ValidationError(
                    id,
                    "barcodeType deve ser um dos tipos suportados: qrcode, code128, code39, ean13, ean8, upc_a, upc_e, pdf417, datamatrix",
                ),
            )
        }
        return errors
    }
}

data class BarcodeStyle(
    val errorCorrection: String = "M",
)

data class ConditionalElement(
    override val type: String = "conditional",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = PositionMode.ABSOLUTE,
    override val relativeOffsetY: Float = 0f,
    val condition: String,
    val elements: List<Element>,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        elements.forEach { element ->
            errors.addAll(element.validate(pageSettings))
        }
        return errors
    }
}

data class LoopElement(
    override val type: String = "loop",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float = 400f,
    val height: Float = 50f,
    val dataBinding: String,
    val startY: Float? = null,
    val itemSpacing: Float = 0f,
    val elements: List<Element>,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        elements.forEach { element ->
            errors.addAll(element.validate(pageSettings))
        }
        return errors
    }
}

class PositionModeTypeAdapter : JsonDeserializer<PositionMode?> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?,
    ): PositionMode? {
        if (json == null || json.isJsonNull) return null
        val value = json.asString.uppercase()
        return try {
            PositionMode.valueOf(value)
        } catch (e: IllegalArgumentException) {
            null
        }
    }
}

class ElementDeserializer : JsonDeserializer<Element> {
    companion object {
        private val gson: Gson by lazy {
            GsonBuilder()
                .registerTypeAdapter(Element::class.java, ElementDeserializer())
                .registerTypeAdapter(PositionMode::class.java, PositionModeTypeAdapter())
                .create()
        }
    }

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext,
    ): Element {
        val jsonObject = json.asJsonObject
        val type =
            jsonObject.get("type")?.asString
                ?: throw IllegalArgumentException("Element must have a 'type' field")

        return when (type) {
            "text" -> gson.fromJson(json, TextElement::class.java)
            "static_text" -> gson.fromJson(json, StaticTextElement::class.java)
            "image" -> gson.fromJson(json, ImageElement::class.java)
            "table" -> gson.fromJson(json, TableElement::class.java)
            "rectangle" -> gson.fromJson(json, RectangleElement::class.java)
            "line" -> gson.fromJson(json, LineElement::class.java)
            "barcode" -> gson.fromJson(json, BarcodeElement::class.java)
            "conditional" -> gson.fromJson(json, ConditionalElement::class.java)
            "loop" -> gson.fromJson(json, LoopElement::class.java)
            else -> throw IllegalArgumentException("Unknown element type: $type")
        }
    }
}
