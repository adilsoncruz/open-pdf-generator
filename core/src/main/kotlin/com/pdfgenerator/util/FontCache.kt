package com.pdfgenerator.util

import org.openpdf.text.pdf.BaseFont
import java.util.concurrent.ConcurrentHashMap

object FontCache {
    private val cache = ConcurrentHashMap<String, BaseFont>()

    fun getFont(
        fontName: String,
        encoding: String = BaseFont.CP1252,
        embedded: Boolean = false,
    ): BaseFont {
        val key = "$fontName|$encoding|$embedded"
        return cache.getOrPut(key) {
            BaseFont.createFont(
                fontName,
                encoding,
                if (embedded) BaseFont.EMBEDDED else BaseFont.NOT_EMBEDDED,
            )
        }
    }

    fun clear() {
        cache.clear()
    }

    fun size(): Int = cache.size
}
