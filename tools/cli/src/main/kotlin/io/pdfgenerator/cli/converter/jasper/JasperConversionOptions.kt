package io.pdfgenerator.cli.converter.jasper

import java.io.File

data class JasperConversionOptions(
    val failOnUnsupportedElement: Boolean = false,
    val author: String = "",
    val defaultItemsBinding: String = "items",
    val enableTableInference: Boolean = true,
    val wrapDetailInLoop: Boolean = false,
    val baseDir: File? = null,
)
