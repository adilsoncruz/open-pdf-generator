package com.pdfgenerator.model

data class SpacerElement(
    override val type: String = "spacer",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Any = "100%",
    val height: Float = 0f,
    val printCondition: String? = null
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
    
    override fun validate(pageSettings: PageSettings): List<ValidationError> = emptyList()
}
