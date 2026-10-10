package com.pdfgenerator.model

data class PageBreakElement(
    override val type: String = "page_break",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = PositionMode.RELATIVE,
    override val relativeOffsetY: Float? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> = emptyList()
}
