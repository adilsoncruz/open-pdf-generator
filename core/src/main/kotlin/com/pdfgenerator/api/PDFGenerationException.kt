package com.pdfgenerator.api

class PDFGenerationException(
    message: String,
    cause: Throwable? = null
) : Exception(message, cause)

