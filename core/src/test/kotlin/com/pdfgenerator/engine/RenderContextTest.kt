package com.pdfgenerator.engine

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RenderContextTest {
    
    @Nested
    inner class RenderStateTests {
        
        @Test
        fun `should initialize currentY to 0`() {
            val state = RenderState()
            
            assertEquals(0f, state.currentY)
        }
        
        @Test
        fun `should update maxY when new value is greater`() {
            val state = RenderState()
            
            state.updateMaxY(100f)
            assertEquals(100f, state.currentY)
            
            state.updateMaxY(200f)
            assertEquals(200f, state.currentY)
        }
        
        @Test
        fun `should not update maxY when new value is smaller`() {
            val state = RenderState()
            
            state.updateMaxY(200f)
            assertEquals(200f, state.currentY)
            
            state.updateMaxY(100f)
            assertEquals(200f, state.currentY)
        }
        
        @Test
        fun `should handle zero updates`() {
            val state = RenderState()
            state.updateMaxY(50f)
            
            state.updateMaxY(0f)
            assertEquals(50f, state.currentY)
        }
        
        @Test
        fun `should handle negative values`() {
            val state = RenderState()
            
            state.updateMaxY(-10f)
            assertEquals(0f, state.currentY)
        }
        
        @Test
        fun `should handle equal values`() {
            val state = RenderState()
            
            state.updateMaxY(100f)
            state.updateMaxY(100f)
            assertEquals(100f, state.currentY)
        }
    }
    
    @Nested
    inner class LoopContextTests {
        
        @Test
        fun `should create loop context with item and index`() {
            val item = mapOf("name" to "Test Item", "price" to 100)
            val context = LoopContext(item = item, index = 0)
            
            assertEquals(item, context.item)
            assertEquals(0, context.index)
        }
        
        @Test
        fun `should create loop context with null item`() {
            val context = LoopContext(item = null, index = 5)
            
            assertNull(context.item)
            assertEquals(5, context.index)
        }
        
        @Test
        fun `should create loop context with primitive item`() {
            val context = LoopContext(item = "string item", index = 2)
            
            assertEquals("string item", context.item)
            assertEquals(2, context.index)
        }
        
        @Test
        fun `should create loop context with list item`() {
            val item = listOf("a", "b", "c")
            val context = LoopContext(item = item, index = 0)
            
            assertEquals(item, context.item)
        }
        
        @Test
        fun `should support data class equality`() {
            val context1 = LoopContext(item = "test", index = 1)
            val context2 = LoopContext(item = "test", index = 1)
            val context3 = LoopContext(item = "test", index = 2)
            
            assertEquals(context1, context2)
            assertEquals(context1.hashCode(), context2.hashCode())
            assertFalse(context1 == context3)
        }
        
        @Test
        fun `should support copy`() {
            val original = LoopContext(item = mapOf("id" to 1), index = 0)
            val copy = original.copy(index = 1)
            
            assertEquals(original.item, copy.item)
            assertEquals(1, copy.index)
        }
    }
}
