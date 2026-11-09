package com.pdfgenerator.model

data class LoopElement(
    override val type: String = "loop",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any? = 400f,
    val height: Float = 50f,
    val dataBinding: String,
    val startY: Float? = null,
    val itemSpacing: Float = 0f,
    val elements: List<Element>,
    override val printCondition: String? = null,
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
