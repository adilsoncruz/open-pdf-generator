package com.pdfgenerator.model

data class ElementGroup(
    val id: String,
    val name: String? = null,
    val elementIds: List<String>,
    val printCondition: String? = null
)

