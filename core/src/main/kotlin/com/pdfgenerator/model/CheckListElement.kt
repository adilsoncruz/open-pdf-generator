package com.pdfgenerator.model

enum class CheckStyle {
    BORDERED,
    RECTANGLE,
    CIRCLE,
}

/**
 * Renders a key/value map as a checklist. Each entry becomes one row:
 * the key is the label and a `true` value marks the row as checked.
 */
data class CheckListElement(
    override val type: String = "check_list",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float = 400f,
    val height: Float = 50f,
    val dataBinding: String = "",
    val startY: Float? = null,
    val itemSpacing: Float = 0f,
    val checkStyle: CheckStyle? = CheckStyle.RECTANGLE,
    val style: TextStyle? = null,
    val printCondition: String? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding.isBlank()) {
            errors.add(ValidationError(id, "CheckListElement must have a dataBinding"))
        }
        return errors
    }
}
