package com.pdfgenerator.util

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.awt.Color
import kotlin.test.assertEquals

class ColorUtilTest {
    
    @AfterEach
    fun tearDown() {
        ColorUtil.clearCache()
    }
    
    @Test
    fun `should convert hex color with hash prefix to Color`() {
        val color = ColorUtil.hexToColor("#FF0000")
        
        assertEquals(255, color.red)
        assertEquals(0, color.green)
        assertEquals(0, color.blue)
    }
    
    @Test
    fun `should convert hex color without hash prefix to Color`() {
        val color = ColorUtil.hexToColor("00FF00")
        
        assertEquals(0, color.red)
        assertEquals(255, color.green)
        assertEquals(0, color.blue)
    }
    
    @Test
    fun `should convert blue hex color`() {
        val color = ColorUtil.hexToColor("#0000FF")
        
        assertEquals(0, color.red)
        assertEquals(0, color.green)
        assertEquals(255, color.blue)
    }
    
    @Test
    fun `should convert white hex color`() {
        val color = ColorUtil.hexToColor("#FFFFFF")
        
        assertEquals(255, color.red)
        assertEquals(255, color.green)
        assertEquals(255, color.blue)
    }
    
    @Test
    fun `should convert black hex color`() {
        val color = ColorUtil.hexToColor("#000000")
        
        assertEquals(0, color.red)
        assertEquals(0, color.green)
        assertEquals(0, color.blue)
    }
    
    @Test
    fun `should convert mixed hex color`() {
        val color = ColorUtil.hexToColor("#1A2B3C")
        
        assertEquals(26, color.red)
        assertEquals(43, color.green)
        assertEquals(60, color.blue)
    }
    
    @Test
    fun `should convert lowercase hex color`() {
        val color = ColorUtil.hexToColor("#ff5500")
        
        assertEquals(255, color.red)
        assertEquals(85, color.green)
        assertEquals(0, color.blue)
    }
    
    @Test
    fun `should throw exception for invalid hex color length`() {
        assertThrows<IllegalArgumentException> {
            ColorUtil.hexToColor("#FFF")
        }
    }
    
    @Test
    fun `should throw exception for empty hex color`() {
        assertThrows<IllegalArgumentException> {
            ColorUtil.hexToColor("")
        }
    }
    
    @Test
    fun `should throw exception for hex color too long`() {
        assertThrows<IllegalArgumentException> {
            ColorUtil.hexToColor("#FFFFFFF")
        }
    }
    
    @Test
    fun `should convert Color to hex string`() {
        val hex = ColorUtil.colorToHex(Color(255, 0, 0))
        
        assertEquals("#ff0000", hex)
    }
    
    @Test
    fun `should convert green Color to hex string`() {
        val hex = ColorUtil.colorToHex(Color(0, 255, 0))
        
        assertEquals("#00ff00", hex)
    }
    
    @Test
    fun `should convert blue Color to hex string`() {
        val hex = ColorUtil.colorToHex(Color(0, 0, 255))
        
        assertEquals("#0000ff", hex)
    }
    
    @Test
    fun `should convert white Color to hex string`() {
        val hex = ColorUtil.colorToHex(Color.WHITE)
        
        assertEquals("#ffffff", hex)
    }
    
    @Test
    fun `should convert black Color to hex string`() {
        val hex = ColorUtil.colorToHex(Color.BLACK)
        
        assertEquals("#000000", hex)
    }
    
    @Test
    fun `should cache colors for performance`() {
        assertEquals(0, ColorUtil.cacheSize())
        
        ColorUtil.hexToColor("#FF0000")
        assertEquals(1, ColorUtil.cacheSize())
        
        ColorUtil.hexToColor("#FF0000")
        assertEquals(1, ColorUtil.cacheSize())
        
        ColorUtil.hexToColor("#00FF00")
        assertEquals(2, ColorUtil.cacheSize())
    }
    
    @Test
    fun `should clear cache`() {
        ColorUtil.hexToColor("#FF0000")
        ColorUtil.hexToColor("#00FF00")
        assertEquals(2, ColorUtil.cacheSize())
        
        ColorUtil.clearCache()
        assertEquals(0, ColorUtil.cacheSize())
    }
    
    @Test
    fun `should return same Color instance from cache`() {
        val color1 = ColorUtil.hexToColor("#FF0000")
        val color2 = ColorUtil.hexToColor("#FF0000")
        
        assert(color1 === color2)
    }
}
