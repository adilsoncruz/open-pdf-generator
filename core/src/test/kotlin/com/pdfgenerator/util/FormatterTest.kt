package com.pdfgenerator.util

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.util.Date
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FormatterTest {
    
    @Nested
    inner class TextFormat {
        
        @Test
        fun `should return value as string for text format`() {
            assertEquals("Hello", Formatter.format("Hello", "text"))
        }
        
        @Test
        fun `should return value as string for null format`() {
            assertEquals("Hello", Formatter.format("Hello", null))
        }
        
        @Test
        fun `should return value as string for default format`() {
            assertEquals("Hello", Formatter.format("Hello"))
        }
        
        @Test
        fun `should convert number to string for text format`() {
            assertEquals("42", Formatter.format(42, "text"))
        }
        
        @Test
        fun `should convert boolean to string for text format`() {
            assertEquals("true", Formatter.format(true, "text"))
        }
        
        @Test
        fun `should return empty string for null value`() {
            assertEquals("", Formatter.format(null, "text"))
        }
    }
    
    @Nested
    inner class UppercaseFormat {
        
        @Test
        fun `should convert string to uppercase`() {
            assertEquals("HELLO WORLD", Formatter.format("hello world", "uppercase"))
        }
        
        @Test
        fun `should handle mixed case`() {
            assertEquals("HELLO WORLD", Formatter.format("HeLLo WoRLd", "uppercase"))
        }
        
        @Test
        fun `should handle empty string`() {
            assertEquals("", Formatter.format("", "uppercase"))
        }
    }
    
    @Nested
    inner class LowercaseFormat {
        
        @Test
        fun `should convert string to lowercase`() {
            assertEquals("hello world", Formatter.format("HELLO WORLD", "lowercase"))
        }
        
        @Test
        fun `should handle mixed case`() {
            assertEquals("hello world", Formatter.format("HeLLo WoRLd", "lowercase"))
        }
        
        @Test
        fun `should handle empty string`() {
            assertEquals("", Formatter.format("", "lowercase"))
        }
    }
    
    @Nested
    inner class CurrencyFormat {
        
        @Test
        fun `should format integer as currency`() {
            val result = Formatter.format(1234, "currency")
            assertTrue(result.contains("1.234") || result.contains("1,234"))
        }
        
        @Test
        fun `should format double as currency`() {
            val result = Formatter.format(1234.56, "currency")
            assertTrue(result.contains("1.234,56") || result.contains("1,234.56"))
        }
        
        @Test
        fun `should format string number as currency`() {
            val result = Formatter.format("1234.56", "currency")
            assertTrue(result.contains("1.234,56") || result.contains("1,234.56"))
        }
        
        @Test
        fun `should return original string for invalid number string`() {
            assertEquals("not a number", Formatter.format("not a number", "currency"))
        }
        
        @Test
        fun `should format zero as currency`() {
            val result = Formatter.format(0, "currency")
            assertTrue(result.contains("0"))
        }
        
        @Test
        fun `should format negative number as currency`() {
            val result = Formatter.format(-1234.56, "currency")
            assertTrue(result.contains("1.234,56") || result.contains("1,234.56"))
        }
    }
    
    @Nested
    inner class NumberFormat {
        
        @Test
        fun `should format integer as number`() {
            val result = Formatter.format(1234567, "number")
            assertTrue(result.contains("1.234.567") || result.contains("1,234,567"))
        }
        
        @Test
        fun `should format double as number`() {
            val result = Formatter.format(1234.567, "number")
            assertTrue(result.contains("1.234") || result.contains("1,234"))
        }
        
        @Test
        fun `should format string number`() {
            val result = Formatter.format("1234.56", "number")
            assertTrue(result.contains("1.234") || result.contains("1,234"))
        }
        
        @Test
        fun `should return original string for invalid number string`() {
            assertEquals("not a number", Formatter.format("not a number", "number"))
        }
    }
    
    @Nested
    inner class DateFormat {
        
        @Test
        fun `should format Date object`() {
            @Suppress("DEPRECATION")
            val date = Date(124, 0, 15) // 2024-01-15
            val result = Formatter.format(date, "date")
            
            assertTrue(result.contains("15") && result.contains("01") && result.contains("2024"))
        }
        
        @Test
        fun `should format timestamp as date`() {
            val timestamp = 1705276800000L // 2024-01-15
            val result = Formatter.format(timestamp, "date")
            
            assertTrue(result.contains("2024"))
        }
        
        @Test
        fun `should format ISO date string`() {
            val result = Formatter.format("2024-01-15", "date")
            
            assertTrue(result.contains("15") && result.contains("01") && result.contains("2024"))
        }
        
        @Test
        fun `should format date with time string`() {
            val result = Formatter.format("2024-01-15T10:30:00", "date")
            
            assertTrue(result.contains("15") && result.contains("01") && result.contains("2024"))
        }
        
        @Test
        fun `should return original string for unparseable date`() {
            assertEquals("invalid date", Formatter.format("invalid date", "date"))
        }
    }
    
    @Nested
    inner class DateTimeFormat {
        
        @Test
        fun `should format Date object with time`() {
            @Suppress("DEPRECATION")
            val date = Date(124, 0, 15, 10, 30) // 2024-01-15 10:30
            val result = Formatter.format(date, "datetime")
            
            assertTrue(result.contains("15") && result.contains("01") && result.contains("2024"))
            assertTrue(result.contains("10") && result.contains("30"))
        }
        
        @Test
        fun `should format timestamp as datetime`() {
            val timestamp = 1705315800000L // 2024-01-15 10:30 UTC
            val result = Formatter.format(timestamp, "datetime")
            
            assertTrue(result.contains("2024"))
        }
        
        @Test
        fun `should format ISO datetime string`() {
            val result = Formatter.format("2024-01-15T10:30:00", "datetime")
            
            assertTrue(result.contains("2024"))
        }
    }
    
    @Nested
    inner class EdgeCases {
        
        @Test
        fun `should handle unknown format as text`() {
            assertEquals("Hello", Formatter.format("Hello", "unknown"))
        }
        
        @Test
        fun `should handle case insensitive format`() {
            assertEquals("HELLO", Formatter.format("hello", "UPPERCASE"))
        }
        
        @Test
        fun `should handle empty value for all formats`() {
            assertEquals("", Formatter.format("", "text"))
            assertEquals("", Formatter.format("", "uppercase"))
            assertEquals("", Formatter.format("", "lowercase"))
            assertEquals("", Formatter.format("", "date"))
            assertEquals("", Formatter.format("", "datetime"))
        }
    }
}
