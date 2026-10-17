package com.pdfgenerator.model

data class LinkElement(
    override val type: String = "link",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float? = null,
    val height: Float? = null,
    val dataBinding: String? = null,
    val value: String? = null,
    val url: String,
    val style: TextStyle? = null,
    val printCondition: String? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return width ?: containerWidth
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding == null && value == null) {
            errors.add(ValidationError(id, "LinkElement must have dataBinding or value"))
        }
        if (url.isBlank()) {
            errors.add(ValidationError(id, "LinkElement must have a valid url"))
        }
        return errors
    }
}
