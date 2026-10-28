package com.pdfgenerator.model

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
    val backgroundColor: String? = null,
    val strokeColor: String? = null,
    val strokeWidth: Float? = null,
) {
    fun getEffectiveFillColor(): String? = fillColor ?: backgroundColor

    fun getEffectivePenStyle(): String? = penStyle ?: borderStyle

    fun getEffectiveBorderWidth(): Float = strokeWidth ?: borderWidth

    fun getEffectiveBorderColor(): String? {
        return borderColor ?: strokeColor ?: if (getEffectiveBorderWidth() > 0) "#000000" else null
    }

    fun shouldDrawBorder(): Boolean {
        if (getEffectivePenStyle()?.lowercase() == "none") return false
        return borderColor != null || strokeColor != null || getEffectiveBorderWidth() > 0
    }
}
