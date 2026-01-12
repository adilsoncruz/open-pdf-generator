package com.pdfgenerator.template

import com.pdfgenerator.model.*
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ElementsTest {
    
    @Test
    fun `should create TextElement with default values`() {
        val element = TextElement(
            id = "text1",
            x = 50f,
            y = 50f
        )
        
        assertEquals("text1", element.id)
        assertEquals(50f, element.x)
        assertEquals(50f, element.y)
        assertEquals("text", element.type)
    }
    
    @Test
    fun `should create TextElement with style`() {
        val style = TextStyle(
            fontSize = 24f,
            fontWeight = "bold",
            fontFamily = "Helvetica",
            color = "#FF0000"
        )
        
        val element = TextElement(
            id = "text1",
            x = 50f,
            y = 50f,
            style = style
        )
        
        assertNotNull(element.style)
        assertEquals(24f, element.style?.fontSize)
        assertEquals("bold", element.style?.fontWeight)
    }
    
    @Test
    fun `should create RectangleElement with dimensions`() {
        val element = RectangleElement(
            id = "rect1",
            x = 50f,
            y = 50f,
            width = 100,
            height = 50
        )
        
        assertEquals("rect1", element.id)
        assertEquals(100, element.width)
        assertEquals(50, element.height)
        assertEquals(100f, element.resolveWidth(500f))
        assertEquals(50f, element.resolveHeight(800f))
    }
    
    @Test
    fun `should resolve RectangleElement width as 100 percent`() {
        val element = RectangleElement(
            id = "rect1",
            x = 0f,
            y = 50f,
            width = "100%",
            height = 50
        )
        
        val pageWidth = 500f
        assertEquals(pageWidth, element.resolveWidth(pageWidth))
    }
    
    @Test
    fun `should resolve RectangleElement height as 100 percent`() {
        val element = RectangleElement(
            id = "rect1",
            x = 0f,
            y = 0f,
            width = 100,
            height = "100%"
        )
        
        val pageHeight = 800f
        assertEquals(pageHeight, element.resolveHeight(pageHeight))
    }
    
    @Test
    fun `should create LineElement with coordinates`() {
        val element = LineElement(
            id = "line1",
            x = 50f,
            y = 50f,
            x2 = 200f,
            y2 = 100f
        )
        
        assertEquals("line1", element.id)
        assertEquals(200f, element.x2)
        assertEquals(100f, element.y2)
    }
    
    @Test
    fun `should create ImageElement with default fit and alignment`() {
        val element = ImageElement(
            id = "img1",
            x = 50f,
            y = 50f,
            width = 100f,
            height = 100f,
            source = "path/to/image.jpg"
        )
        
        assertEquals("img1", element.id)
        assertEquals("contain", element.getEffectiveFit())
        assertEquals("center", element.getEffectiveAlignment())
    }
    
    @Test
    fun `should create ImageElement with custom fit and alignment`() {
        val element = ImageElement(
            id = "img1",
            x = 50f,
            y = 50f,
            width = 100f,
            height = 100f,
            source = "path/to/image.jpg",
            fit = "cover",
            alignment = "top-left"
        )
        
        assertEquals("cover", element.getEffectiveFit())
        assertEquals("top-left", element.getEffectiveAlignment())
    }
    
    @Test
    fun `should create BarcodeElement with default values`() {
        val element = BarcodeElement(
            id = "barcode1",
            x = 50f,
            y = 50f,
            width = 200f,
            height = 100f,
            barcodeType = "QR_CODE",
            dataBinding = "invoice.code"
        )
        
        assertEquals("barcode1", element.id)
        assertEquals("QR_CODE", element.barcodeType)
        assertEquals("invoice.code", element.dataBinding)
    }
    
    @Test
    fun `should create TableElement with columns`() {
        val column1 = TableColumn(
            header = "Name",
            field = "name",
            width = 100f
        )
        
        val column2 = TableColumn(
            header = "Price",
            field = "price",
            width = 80f
        )
        
        val element = TableElement(
            id = "table1",
            x = 50f,
            y = 50f,
            dataBinding = "items",
            columns = listOf(column1, column2)
        )
        
        assertEquals("table1", element.id)
        assertEquals(2, element.columns.size)
        assertEquals("items", element.dataBinding)
    }
    
    @Test
    fun `should resolve TableElement width as 100 percent`() {
        val element = TableElement(
            id = "table1",
            x = 0f,
            y = 50f,
            dataBinding = "items",
            width = "100%",
            columns = emptyList()
        )
        
        val pageWidth = 500f
        assertEquals(pageWidth, element.resolveWidth(pageWidth))
    }
    
    @Test
    fun `should resolve TableElement width as number`() {
        val element = TableElement(
            id = "table1",
            x = 50f,
            y = 50f,
            dataBinding = "items",
            width = 300,
            columns = emptyList()
        )
        
        assertEquals(300f, element.resolveWidth(500f))
    }
    
    @Test
    fun `should create ConditionalElement`() {
        val element = ConditionalElement(
            id = "cond1",
            x = 50f,
            y = 50f,
            condition = "user.active == true",
            elements = listOf(
                TextElement(
                    id = "text1",
                    x = 0f,
                    y = 0f,
                    value = "Active user"
                )
            )
        )
        
        assertEquals("cond1", element.id)
        assertEquals("user.active == true", element.condition)
        assertEquals(1, element.elements.size)
    }
    
    @Test
    fun `should create LoopElement`() {
        val element = LoopElement(
            id = "loop1",
            x = 50f,
            y = 50f,
            dataBinding = "items",
            elements = listOf(
                TextElement(
                    id = "text1",
                    x = 0f,
                    y = 0f,
                    dataBinding = "name"
                )
            )
        )
        
        assertEquals("loop1", element.id)
        assertEquals("items", element.dataBinding)
        assertEquals(1, element.elements.size)
    }
    
    @Test
    fun `should create TableStyle with default values`() {
        val style = TableStyle()
        
        assertNotNull(style)
    }
    
    @Test
    fun `should create RectangleStyle with colors`() {
        val style = RectangleStyle(
            fillColor = "#FF0000",
            borderWidth = 2f,
            borderColor = "#000000"
        )
        
        assertEquals("#FF0000", style.fillColor)
        assertEquals(2f, style.borderWidth)
        assertEquals("#000000", style.borderColor)
    }
    
    @Test
    fun `should create LineStyle with width`() {
        val style = LineStyle(
            color = "#000000",
            width = 2f
        )
        
        assertEquals("#000000", style.color)
        assertEquals(2f, style.width)
    }
    
    @Test
    fun `should create BarcodeStyle`() {
        val style = BarcodeStyle()
        
        assertNotNull(style)
    }
}

