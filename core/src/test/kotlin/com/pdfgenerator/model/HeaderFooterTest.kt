package com.pdfgenerator.model

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class HeaderFooterTest {
    
    @Nested
    inner class Construction {
        
        @Test
        fun `should create header with height only`() {
            val header = HeaderFooter(height = 50f)
            
            assertEquals(50f, header.height)
            assertTrue(header.elements.isEmpty())
            assertNull(header.groups)
            assertNull(header.printCondition)
        }
        
        @Test
        fun `should create header with elements`() {
            val elements = listOf(
                TextElement(id = "text1", x = 0f, y = 0f, value = "Header"),
                LineElement(id = "line1", x = 0f, y = 40f, width = 100f, height = 0f)
            )
            
            val header = HeaderFooter(height = 50f, elements = elements)
            
            assertEquals(50f, header.height)
            assertEquals(2, header.elements.size)
        }
        
        @Test
        fun `should create header with groups`() {
            val groups = listOf(
                ElementGroup(id = "group1", elementIds = listOf("text1", "text2"))
            )
            
            val header = HeaderFooter(
                height = 50f,
                elements = emptyList(),
                groups = groups
            )
            
            assertEquals(1, header.groups?.size)
            assertEquals("group1", header.groups?.first()?.id)
        }
        
        @Test
        fun `should create header with print condition`() {
            val header = HeaderFooter(
                height = 50f,
                printCondition = "pageNumber > 1"
            )
            
            assertEquals("pageNumber > 1", header.printCondition)
        }
        
        @Test
        fun `should create footer with all properties`() {
            val footer = HeaderFooter(
                height = 30f,
                elements = listOf(
                    TextElement(id = "pageNum", x = 0f, y = 10f, dataBinding = "pageNumber")
                ),
                groups = listOf(
                    ElementGroup(id = "footerGroup", elementIds = listOf("pageNum"))
                ),
                printCondition = "showFooter == true"
            )
            
            assertEquals(30f, footer.height)
            assertEquals(1, footer.elements.size)
            assertEquals(1, footer.groups?.size)
            assertEquals("showFooter == true", footer.printCondition)
        }
    }
    
    @Nested
    inner class DataClassBehavior {
        
        @Test
        fun `should support equals and hashCode`() {
            val header1 = HeaderFooter(height = 50f)
            val header2 = HeaderFooter(height = 50f)
            val header3 = HeaderFooter(height = 60f)
            
            assertEquals(header1, header2)
            assertEquals(header1.hashCode(), header2.hashCode())
            assertTrue(header1 != header3)
        }
        
        @Test
        fun `should support copy`() {
            val original = HeaderFooter(height = 50f, printCondition = "always")
            val copy = original.copy(height = 60f)
            
            assertEquals(60f, copy.height)
            assertEquals("always", copy.printCondition)
        }
    }
}
