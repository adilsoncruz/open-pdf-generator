package com.pdfgenerator.model

data class HeaderFooter(
    val height: Float,
    val elements: List<Element> = emptyList(),
    val groups: List<ElementGroup>? = null,
    val printCondition: String? = null
)

