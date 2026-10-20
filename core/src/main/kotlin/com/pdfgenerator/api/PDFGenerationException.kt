package com.pdfgenerator.api

open class PDFGenerationException(
    message: String,
    cause: Throwable? = null,
) : Exception(message, cause)

data class SchemaValidationError(
    val path: String,
    val message: String,
    val keyword: String? = null,
)

class PDFSchemaValidationException(
    val errors: List<SchemaValidationError>,
    customMessage: String? = null,
    cause: Throwable? = null,
) : PDFGenerationException(
        customMessage ?: buildString {
            append("Data schema validation failed with ${errors.size} error(s):")
            errors.forEach { err ->
                append("\n  - ${err.path}: ${err.message}")
            }
        },
        cause,
    )
