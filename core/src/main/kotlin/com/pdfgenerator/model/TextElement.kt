package com.pdfgenerator.model

data class TextElement(
    override val type: String = "text",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float? = null,
    val height: Float? = null,
    val multiline: Boolean? = null,
    val dataBinding: String? = null,
    val value: String? = null,
    val style: TextStyle? = null,
    val printCondition: String? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return width ?: containerWidth
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding == null && value == null) {
            errors.add(ValidationError(id, "TextElement deve ter dataBinding ou value"))
        }
        return errors
    }
}

data class StaticTextElement(
    override val type: String = "static_text",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float? = null,
    val height: Float? = null,
    val multiline: Boolean? = null,
    val value: String,
    val style: TextStyle? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return width ?: containerWidth
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (value.isBlank()) {
            errors.add(ValidationError(id, "StaticTextElement must have non-empty value"))
        }
        return errors
    }
}

data class TextStyle(
    val fontSize: Float = 12f,
    val fontFamily: String = "Helvetica",
    val fontWeight: String = "normal",
    val fontStyle: String = "normal",
    val color: String = "#000000",
    val backgroundColor: String? = null,
    val alignment: String = "left",
    val verticalAlignment: String = "center",
    val lineHeight: Float? = null,
    val multiline: Boolean = false,
    val firstLineIndent: Float = 0f,
    val paddingTop: Float = 0f,
    val paddingBottom: Float = 0f,
    val paddingLeft: Float = 0f,
    val paddingRight: Float = 0f,
    val overflow: String = "visible",
)
