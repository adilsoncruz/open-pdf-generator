package com.pdfgenerator.model

data class ContainerElement(
    override val type: String = "container",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val relativeOffsetY: Float? = null,
    val width: Any? = 400f,
    val height: Any? = 50f,
    val elements: List<Element>,
    val style: RectangleStyle? = null,
    val printCondition: String? = null,
    val heightMode: String? = "auto",
    val autoHeight: Boolean? = true,
) : Element {
    fun isAutoHeight(): Boolean = (heightMode ?: "auto").equals("auto", ignoreCase = true) && (autoHeight != false)

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
            else -> containerWidth
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
                    height.toFloatOrNull() ?: containerHeight
                }
            }
            else -> containerHeight
        }
    }

    override val positionMode: PositionMode = PositionMode.RELATIVE

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        elements.forEach { element ->
            errors.addAll(element.validate(pageSettings))
        }
        return errors
    }
}
