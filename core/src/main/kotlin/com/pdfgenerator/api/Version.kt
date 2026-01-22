package com.pdfgenerator.api

/**
 * Version information for the PDF Generator library.
 */
object Version {
    const val NAME = "Open PDF Generator"
    const val VERSION = "1.0.0"
    const val FULL_NAME = "$NAME v$VERSION"

    /**
     * Returns version info as a formatted string.
     */
    fun info(): String = FULL_NAME
}
