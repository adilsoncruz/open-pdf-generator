package com.pdfgenerator.util

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class DataBindingResolverTest {
    @Test
    fun `should resolve simple property`() {
        val data = mapOf("name" to "John")

        assertEquals("John", DataBindingResolver.resolve("name", data))
    }

    @Test
    fun `should resolve nested property`() {
        val data =
            mapOf(
                "user" to
                    mapOf(
                        "name" to "John",
                    ),
            )

        assertEquals("John", DataBindingResolver.resolve("user.name", data))
    }

    @Test
    fun `should resolve deeply nested property`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "customer" to
                            mapOf(
                                "address" to
                                    mapOf(
                                        "city" to "New York",
                                    ),
                            ),
                    ),
            )

        assertEquals("New York", DataBindingResolver.resolve("invoice.customer.address.city", data))
    }

    @Test
    fun `should resolve array length`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2", "item3"),
            )

        assertEquals(3, DataBindingResolver.resolve("items.length", data))
    }

    @Test
    fun `should resolve array size`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2"),
            )

        assertEquals(2, DataBindingResolver.resolve("items.size", data))
    }

    @Test
    fun `should resolve indexed array access`() {
        val data =
            mapOf(
                "items" to listOf("first", "second", "third"),
            )

        assertEquals("first", DataBindingResolver.resolve("items.0", data))
        assertEquals("second", DataBindingResolver.resolve("items.1", data))
        assertEquals("third", DataBindingResolver.resolve("items.2", data))
    }

    @Test
    fun `should resolve nested property in array element`() {
        val data =
            mapOf(
                "items" to
                    listOf(
                        mapOf("name" to "Item 1", "price" to 100),
                        mapOf("name" to "Item 2", "price" to 200),
                    ),
            )

        assertEquals("Item 1", DataBindingResolver.resolve("items.0.name", data))
        assertEquals(100, DataBindingResolver.resolve("items.0.price", data))
        assertEquals("Item 2", DataBindingResolver.resolve("items.1.name", data))
        assertEquals(200, DataBindingResolver.resolve("items.1.price", data))
    }

    @Test
    fun `should resolve array in nested object`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "items" to listOf("item1", "item2", "item3"),
                    ),
            )

        assertEquals(3, DataBindingResolver.resolve("invoice.items.length", data))
    }

    @Test
    fun `should return null for missing property`() {
        val data = mapOf("name" to "John")

        assertNull(DataBindingResolver.resolve("age", data))
    }

    @Test
    fun `should return null for missing nested property`() {
        val data =
            mapOf(
                "user" to
                    mapOf(
                        "name" to "John",
                    ),
            )

        assertNull(DataBindingResolver.resolve("user.age", data))
    }

    @Test
    fun `should return null for invalid array index`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2"),
            )

        assertNull(DataBindingResolver.resolve("items.5", data))
    }

    @Test
    fun `should handle numeric values`() {
        val data =
            mapOf(
                "price" to 100.50,
            )

        assertEquals(100.50, DataBindingResolver.resolve("price", data))
    }

    @Test
    fun `should handle boolean values`() {
        val data =
            mapOf(
                "active" to true,
            )

        assertEquals(true, DataBindingResolver.resolve("active", data))
    }

    @Test
    fun `should handle null values`() {
        val data =
            mapOf(
                "value" to null,
            )

        assertNull(DataBindingResolver.resolve("value", data))
    }

    @Test
    fun `should return null for empty path`() {
        val data = mapOf("name" to "John")

        assertNull(DataBindingResolver.resolve("", data))
    }

    @Test
    fun `should resolve property from empty data`() {
        val data = emptyMap<String, Any?>()

        assertNull(DataBindingResolver.resolve("name", data))
    }

    @Test
    fun `should resolve array itself`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2", "item3"),
            )

        val result = DataBindingResolver.resolve("items", data)
        assertEquals(listOf("item1", "item2", "item3"), result)
    }

    @Test
    fun `should resolve object itself`() {
        val userData = mapOf("name" to "John", "age" to 30)
        val data = mapOf("user" to userData)

        val result = DataBindingResolver.resolve("user", data)
        assertEquals(userData, result)
    }

    @Test
    fun `should handle mixed case property names`() {
        val data =
            mapOf(
                "firstName" to "John",
                "lastName" to "Doe",
            )

        assertEquals("John", DataBindingResolver.resolve("firstName", data))
        assertEquals("Doe", DataBindingResolver.resolve("lastName", data))
    }

    @Test
    fun `should resolve array length for empty array`() {
        val data =
            mapOf(
                "items" to emptyList<Any>(),
            )

        assertEquals(0, DataBindingResolver.resolve("items.length", data))
    }

    @Test
    fun `should resolve complex nested structure`() {
        val data =
            mapOf(
                "company" to
                    mapOf(
                        "departments" to
                            listOf(
                                mapOf(
                                    "name" to "IT",
                                    "employees" to
                                        listOf(
                                            mapOf("name" to "Alice", "role" to "Developer"),
                                            mapOf("name" to "Bob", "role" to "Manager"),
                                        ),
                                ),
                            ),
                    ),
            )

        assertEquals("Alice", DataBindingResolver.resolve("company.departments.0.employees.0.name", data))
        assertEquals("Developer", DataBindingResolver.resolve("company.departments.0.employees.0.role", data))
    }
}
