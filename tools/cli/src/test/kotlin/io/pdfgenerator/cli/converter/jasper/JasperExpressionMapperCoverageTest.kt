package io.pdfgenerator.cli.converter.jasper

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class JasperExpressionMapperCoverageTest {

    @Test
    fun testNormalizeVar() {
        assertEquals("pageNumber", JasperExpressionMapper.normalizeVar("PAGE_NUMBER"))
        assertEquals("customField", JasperExpressionMapper.normalizeVar("customField"))
    }

    @Test
    fun testMapExpressionNullAndBlank() {
        assertEquals(MappedExpression(), JasperExpressionMapper.mapExpression(null))
        assertEquals(MappedExpression(), JasperExpressionMapper.mapExpression(""))
        assertEquals(MappedExpression(), JasperExpressionMapper.mapExpression("   "))
        assertEquals(MappedExpression(), JasperExpressionMapper.mapExpression("<![CDATA[]]>"))
    }

    @Test
    fun testMapExpressionPureString() {
        val result = JasperExpressionMapper.mapExpression("<![CDATA[\"Hello World\"]]>")
        assertEquals("Hello World", result.value)
        assertNull(result.dataBinding)
    }

    @Test
    fun testMapExpressionPureVariables() {
        assertEquals("customerName", JasperExpressionMapper.mapExpression("\$F{customerName}").dataBinding)
        assertEquals("orgId", JasperExpressionMapper.mapExpression("\$P{orgId}").dataBinding)
        assertEquals("pageNumber", JasperExpressionMapper.mapExpression("\$V{PAGE_NUMBER}").dataBinding)
    }

    @Test
    fun testMapExpressionDataSourceCollection() {
        val res = JasperExpressionMapper.mapExpression("new JRBeanCollectionDataSource(\$F{items})")
        assertEquals("items", res.dataBinding)
    }

    @Test
    fun testMapExpressionPrefixAndSuffix() {
        val prefixRes = JasperExpressionMapper.mapExpression("\"Order #: \" + \$F{orderId}")
        assertEquals("orderId | prefix:'Order #: '", prefixRes.dataBinding)

        val suffixRes = JasperExpressionMapper.mapExpression("\$F{amount} + \" USD\"")
        assertEquals("amount | suffix:' USD'", suffixRes.dataBinding)
    }

    @Test
    fun testMapExpressionUpperAndLower() {
        assertEquals("name | uppercase", JasperExpressionMapper.mapExpression("\$F{name}.toUpperCase()").dataBinding)
        assertEquals("name | lowercase", JasperExpressionMapper.mapExpression("\$F{name}.toLowerCase()").dataBinding)
    }

    @Test
    fun testMapExpressionDateFormat() {
        val res = JasperExpressionMapper.mapExpression("new SimpleDateFormat(\"yyyy-MM-dd\").format(\$F{createdAt})")
        assertEquals("createdAt | date:'yyyy-MM-dd'", res.dataBinding)
    }

    @Test
    fun testMapExpressionConcatenation() {
        val res = JasperExpressionMapper.mapExpression("\"Page \" + \$V{PAGE_NUMBER} + \" of \" + \$P{totalPages}")
        assertEquals("Page \${pageNumber} of \${totalPages}", res.value)

        val unparseable = JasperExpressionMapper.mapExpression("\$F{name} + someFunction()")
        assertNull(unparseable.value)
        assertNull(unparseable.dataBinding)
    }

    @Test
    fun testApplyPattern() {
        assertNull(JasperExpressionMapper.applyPattern(null, "#,##0.00"))
        assertEquals("", JasperExpressionMapper.applyPattern("", "#,##0.00"))
        assertEquals("price", JasperExpressionMapper.applyPattern("price", null))
        assertEquals("price", JasperExpressionMapper.applyPattern("price", ""))

        assertEquals("price | format:'#,##0.00'", JasperExpressionMapper.applyPattern("price", "#,##0.00"))
        assertEquals("price | format:'#,##0.00' | prefix:'$'", JasperExpressionMapper.applyPattern("price", "$#,##0.00"))
        assertEquals("price | format:'#,##0.00' | prefix:'Total: $'", JasperExpressionMapper.applyPattern("price", "Total: $#,##0.00"))
    }

    @Test
    fun testToDataBinding() {
        assertEquals("foo", JasperExpressionMapper.toDataBinding("\$F{foo}"))
        assertNull(JasperExpressionMapper.toDataBinding(null))
    }

    @Test
    fun testToExpression() {
        assertNull(JasperExpressionMapper.toExpression(""))
        assertNull(JasperExpressionMapper.toExpression("   "))
        assertNull(JasperExpressionMapper.toExpression("<![CDATA[]]>"))

        val expr1 = JasperExpressionMapper.toExpression("""${'$'}F{status}.equals("PAID")""")
        assertEquals("""status == "PAID"""", expr1)

        val expr2 = JasperExpressionMapper.toExpression("""${'$'}F{type}.toUpperCase()""")
        assertEquals("type | uppercase", expr2)

        val expr3 = JasperExpressionMapper.toExpression("\"quoted string\"")
        assertEquals("quoted string", expr3)

        val exprUnicode = JasperExpressionMapper.toExpression("""${'$'}F{count} \u003e\u003d 10 && ${'$'}F{flag} !\u003d null""")
        assertEquals("count >= 10 && flag != null", exprUnicode)
    }
}
