package com.pdfgenerator.model

enum class ListMode {
    NUMBERED,
    BULLETED,
    START,
    DASH,
    DIAMOND,
}

data class ListElement(
    override val type: String = "list",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float = 400f,
    val height: Float = 50f,
    val dataBinding: String = "",
    val startY: Float? = null,
    val itemSpacing: Float = 10f,
    val style: TextStyle? = null,
    val listStyle: ListMode? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding.isBlank()) {
            errors.add(ValidationError(id, "ListElement must have a dataBinding"))
        }
        return errors
    }
}
