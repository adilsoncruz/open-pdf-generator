package com.pdfgenerator.model

data class SpacerElement(
    override val type: String = "spacer",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float = 0f,
    val height: Float = 0f,
    val printCondition: String? = null
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> = emptyList()
}
