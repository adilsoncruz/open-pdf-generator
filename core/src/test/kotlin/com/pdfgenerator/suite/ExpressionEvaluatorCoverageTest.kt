package com.pdfgenerator.suite

import com.pdfgenerator.util.ExpressionEvaluator
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ExpressionEvaluatorCoverageTest {

    @Test
    fun `test resolvePropPath array index and size operations`() {
        val data = mapOf(
            "user" to mapOf(
                "roles" to listOf("admin", "editor", "viewer"),
                "emptyList" to emptyList<String>(),
                "age" to 30
            )
        )

        // List size and length
        assertEquals(3, ExpressionEvaluator.resolvePropPath("user.roles.length", data))
        assertEquals(3, ExpressionEvaluator.resolvePropPath("user.roles.size", data))

        // Index access
        assertEquals("admin", ExpressionEvaluator.resolvePropPath("user.roles.0", data))
        assertEquals("viewer", ExpressionEvaluator.resolvePropPath("user.roles.2", data))

        // Out of bounds index
        assertNull(ExpressionEvaluator.resolvePropPath("user.roles.5", data))
        assertNull(ExpressionEvaluator.resolvePropPath("user.roles.-1", data))

        // Invalid index on list
        assertNull(ExpressionEvaluator.resolvePropPath("user.roles.invalid", data))

        // Property access on non-map and non-list
        assertNull(ExpressionEvaluator.resolvePropPath("user.age.nested", data))

        // Null intermediate property
        assertNull(ExpressionEvaluator.resolvePropPath("user.nonexistent.child", data))
    }
}
