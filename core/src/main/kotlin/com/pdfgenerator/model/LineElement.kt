package com.pdfgenerator.model

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
    override val printCondition: String? = null,
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
