package com.pdfgenerator.converter.jasper

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class JasperExpressionMapperTest {
    @Test
    fun `should map field expression to data binding`() {
        assertEquals("customer.name", JasperExpressionMapper.toDataBinding("\$F{customer.name}"))
    }

    @Test
    fun `should map parameter expression to data binding`() {
        assertEquals("logoUrl", JasperExpressionMapper.toDataBinding("\$P{logoUrl}"))
    }

    @Test
    fun `should return null for complex expression`() {
        assertNull(JasperExpressionMapper.toDataBinding("\$F{price} + ' USD'"))
    }
}
