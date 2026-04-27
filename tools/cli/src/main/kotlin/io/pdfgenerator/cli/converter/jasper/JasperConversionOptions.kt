package io.pdfgenerator.cli.converter.jasper

data class JasperConversionOptions(
    val failOnUnsupportedElement: Boolean = false,
    val author: String = "",
)
