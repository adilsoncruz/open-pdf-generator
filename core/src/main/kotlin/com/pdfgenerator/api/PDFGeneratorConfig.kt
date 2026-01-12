package com.pdfgenerator.api

import java.io.File

data class PDFGeneratorConfig(
    val fontDirectory: File? = null,
    val defaultFont: String = "Helvetica",
    val strictMode: Boolean = true,
    val enableImageCache: Boolean = true,
    val imageCacheSize: Int = 100,
    val resourcesDirectory: File? = null
)

