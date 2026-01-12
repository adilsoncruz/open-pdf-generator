package com.pdfgenerator.model

data class BodyBackground(
    val elements: List<Element> = emptyList(),
    val groups: List<ElementGroup>? = null,
    val printCondition: String? = null
)

