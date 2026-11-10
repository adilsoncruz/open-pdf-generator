package com.pdfgenerator.suite

import com.pdfgenerator.engine.DocumentFactory
import com.pdfgenerator.engine.PageFlowOrchestrator
import com.pdfgenerator.model.CustomSize
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.openpdf.text.PageSize
import org.openpdf.text.Rectangle
import java.io.ByteArrayOutputStream
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class EngineCoverageTest {

    @Test
    fun `test DocumentFactory resolvePageSize sizes and orientations`() {
        assertEquals(PageSize.A4, DocumentFactory.resolvePageSize("A4", "portrait"))
        assertEquals(PageSize.A3, DocumentFactory.resolvePageSize("A3", "portrait"))
        assertEquals(PageSize.A5, DocumentFactory.resolvePageSize("A5", "portrait"))
        assertEquals(PageSize.LETTER, DocumentFactory.resolvePageSize("LETTER", "portrait"))
        assertEquals(PageSize.LEGAL, DocumentFactory.resolvePageSize("LEGAL", "portrait"))

        // Landscape
        val a4Landscape = DocumentFactory.resolvePageSize("A4", "landscape")
        assertEquals(PageSize.A4.height, a4Landscape.width)
        assertEquals(PageSize.A4.width, a4Landscape.height)

        // Custom size
        val custom = DocumentFactory.resolvePageSize("CUSTOM", "portrait", CustomSize(300f, 600f))
        assertEquals(300f, custom.width)
        assertEquals(600f, custom.height)

        // Custom size missing
        assertThrows<IllegalArgumentException> {
            DocumentFactory.resolvePageSize("CUSTOM", "portrait", null)
        }

        // Unknown size
        assertThrows<IllegalArgumentException> {
            DocumentFactory.resolvePageSize("UNKNOWN", "portrait")
        }

        // Unknown orientation
        assertThrows<IllegalArgumentException> {
            DocumentFactory.resolvePageSize("A4", "diagonal")
        }
    }

    @Test
    fun `test DocumentFactory createDocument and DocumentSession`() {
        val margins = Margins(20f, 20f, 20f, 20f)
        val doc = DocumentFactory.createDocument(PageSize.A4, margins)
        assertNotNull(doc)
        assertEquals(20f, doc.leftMargin())
        assertEquals(20f, doc.topMargin())

        val template = com.pdfgenerator.model.Template(
            version = "1.0",
            pageSettings = PageSettings(size = "A4", orientation = "portrait", margins = margins),
            pageElements = emptyList()
        )
        val session = DocumentFactory.createSession(
            template = template,
            data = emptyMap(),
            output = ByteArrayOutputStream(),
            config = com.pdfgenerator.api.PDFGeneratorConfig()
        )
        session.finalizeBaseLayer()
        session.close()

        val layout = session.layout
        val copy = layout.copy()
        assertEquals(copy, layout)
        assertEquals(copy.hashCode(), layout.hashCode())
        assertTrue(layout.toString().contains("DocumentLayout"))
    }

    @Test
    fun `test PageFlowOrchestrator effective Y calculations`() {
        val config = com.pdfgenerator.api.PDFGeneratorConfig()
        val orchestrator = PageFlowOrchestrator(com.pdfgenerator.engine.RenderEngine(config), config)

        val rect100 = RectangleElement(
            id = "r_full",
            x = 0f,
            y = 10f,
            width = "100%",
            height = "100%",
            positionMode = PositionMode.RELATIVE
        )
        val rectFixed = RectangleElement(
            id = "r_fixed",
            x = 0f,
            y = 15f,
            width = 100f,
            height = 50f,
            relativeOffsetY = 5f,
            positionMode = PositionMode.RELATIVE
        )
        val textAbsolute = StaticTextElement(
            id = "t_abs",
            x = 10f,
            y = 40f,
            value = "Abs",
            positionMode = PositionMode.ABSOLUTE
        )

        // calculateEffectiveY
        assertEquals(100f, orchestrator.calculateEffectiveY(rect100, true, 100f))
        assertEquals(105f, orchestrator.calculateEffectiveY(rectFixed, true, 100f))
        assertEquals(40f, orchestrator.calculateEffectiveY(textAbsolute, false, 100f))

        // calculateSummaryEffectiveY
        // when flowY == 0
        assertEquals(0f, orchestrator.calculateSummaryEffectiveY(rect100, true, 0f))
        assertEquals(15f, orchestrator.calculateSummaryEffectiveY(rectFixed, true, 0f))
        val rectZeroY = rectFixed.copy(y = 0f)
        assertEquals(5f, orchestrator.calculateSummaryEffectiveY(rectZeroY, true, 0f))

        // when flowY > 0
        assertEquals(85f, orchestrator.calculateSummaryEffectiveY(rectFixed, true, 80f))
        assertEquals(80f, orchestrator.calculateSummaryEffectiveY(rect100, true, 80f))

        // when not relative
        assertEquals(40f, orchestrator.calculateSummaryEffectiveY(textAbsolute, false, 80f))

        // isRelativeFlow and buildGroupIndex
        assertTrue(orchestrator.isRelativeFlow(rect100))
        assertTrue(orchestrator.isRelativeFlow(com.pdfgenerator.model.ContainerElement(id = "cnt_flow", elements = emptyList())))
        assertEquals(false, orchestrator.isRelativeFlow(textAbsolute))

        val group = com.pdfgenerator.model.ElementGroup(id = "g1", elementIds = listOf("t_abs"), printCondition = "1 == 1")
        val groupIndex = orchestrator.buildGroupIndex(listOf(group))
        assertEquals(1, groupIndex.size)
        assertTrue(orchestrator.shouldRenderElement(textAbsolute, groupIndex, emptyMap()))

        val groupFalse = com.pdfgenerator.model.ElementGroup(id = "g2", name = "G2", elementIds = listOf("t_abs"), printCondition = "1 == 2")
        val groupIndexFalse = orchestrator.buildGroupIndex(listOf(groupFalse))
        assertEquals(false, orchestrator.shouldRenderElement(textAbsolute, groupIndexFalse, emptyMap()))

        val elCondFalse = rect100.copy(printCondition = "1 == 2")
        assertEquals(false, orchestrator.shouldRenderElement(elCondFalse, emptyMap(), emptyMap()))

        assertEquals(emptyMap(), orchestrator.buildGroupIndex(null))
        assertEquals(emptyMap(), orchestrator.buildGroupIndex(emptyList()))
    }
}
