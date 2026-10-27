package com.pdfgenerator.model

data class ImageElement(
    override val type: String = "image",
    override val id: String,
    override val x: Float,
    override val y: Float,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float,
    val height: Float,
    val dataBinding: String? = null,
    val source: String? = null,
    val fit: String? = null,
    val alignment: String? = null,
    val printCondition: String? = null,
) : Element {
    fun getEffectiveFit(): String = fit ?: "contain"

    fun getEffectiveAlignment(): String = alignment ?: "center"

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        if (dataBinding == null && source == null) {
            errors.add(ValidationError(id, "ImageElement deve ter dataBinding ou source"))
        }
        return errors
    }
}
