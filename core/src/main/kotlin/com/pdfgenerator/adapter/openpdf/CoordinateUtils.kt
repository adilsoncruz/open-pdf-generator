package com.pdfgenerator.adapter.openpdf

object CoordinateUtils {
    fun topYToPdfBaseline(
        pageHeight: Float,
        topY: Float,
        baselineOffset: Float,
    ): Float = pageHeight - topY - baselineOffset

    fun topYToPdfTop(
        pageHeight: Float,
        topY: Float,
    ): Float = pageHeight - topY
}
