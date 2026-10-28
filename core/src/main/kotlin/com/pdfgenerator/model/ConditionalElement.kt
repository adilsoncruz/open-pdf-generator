package com.pdfgenerator.model

data class ConditionalElement(
    override val type: String = "conditional",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any = 400f,
    val condition: String,
    val elements: List<Element>,
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
            else -> containerWidth
        }
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        elements.forEach { element ->
            errors.addAll(element.validate(pageSettings))
        }
        return errors
    }
}
