package com.pdfgenerator.util

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SyntheticDataResolverTest {
    @Test
    fun `should override page number without cloning full map`() {
        val baseData = mapOf("name" to "Alice", "_pageNumber" to 1)

        val pageData = withSyntheticPageNumber(baseData, 7)

        assertEquals("Alice", pageData["name"])
        assertEquals(7, pageData["_pageNumber"])
        assertEquals(2, pageData.size)
    }

    @Test
    fun `should expose synthetic bindings in map view`() {
        val baseData = mapOf("name" to "Alice")
        val pageData =
            withSyntheticBindings(
                baseData,
                mapOf(
                    "_pageNumber" to 3,
                    "_date" to "2026-04-27",
                ),
            )

        assertTrue(pageData.containsKey("name"))
        assertTrue(pageData.containsKey("_pageNumber"))
        assertTrue(pageData.containsKey("_date"))
        assertFalse(pageData.containsKey("missing"))
        assertEquals(3, pageData.size)
    }
}
