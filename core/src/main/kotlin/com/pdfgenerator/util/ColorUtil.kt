package com.pdfgenerator.util

import java.awt.Color
import java.util.concurrent.ConcurrentHashMap

object ColorUtil {
    
    private val colorCache = ConcurrentHashMap<String, Color>()
    
    fun hexToColor(hex: String): Color {
        return colorCache.getOrPut(hex) {
            parseHexColor(hex)
        }
    }
    
    private fun parseHexColor(hex: String): Color {
        val cleanHex = hex.removePrefix("#")
        
        require(cleanHex.length == 6) {
            "Hex color must have 6 characters (format: #RRGGBB)"
        }
        
        val r = cleanHex.substring(0, 2).toInt(16)
        val g = cleanHex.substring(2, 4).toInt(16)
        val b = cleanHex.substring(4, 6).toInt(16)
        
        return Color(r, g, b)
    }
    
    fun colorToHex(color: Color): String {
        return String.format("#%02x%02x%02x", color.red, color.green, color.blue)
    }
    
    fun clearCache() {
        colorCache.clear()
    }
    
    fun cacheSize(): Int = colorCache.size
}
