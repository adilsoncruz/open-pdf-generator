package com.pdfgenerator.model

import com.google.gson.annotations.SerializedName

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
    @SerializedName("field", alternate = ["key"])
    val field: String = "",
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
    val headerTextColor: String? = null,
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

    fun getEffectiveHeaderColor(): String = headerTextColor ?: headerColor

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
