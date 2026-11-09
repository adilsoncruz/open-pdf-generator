package com.pdfgenerator.engine

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.ElementDeserializer
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.SummaryPage
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Test
import org.openpdf.text.Document
import org.openpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class PageFlowOrchestratorTest {
    private val config = PDFGeneratorConfig()
    private val renderEngine = RenderEngine(config)
    private val orchestrator = PageFlowOrchestrator(renderEngine, config)

    private fun createDummyContext(renderState: RenderState = RenderState()): RenderContext {
        val doc = Document()
        val writer = PdfWriter.getInstance(doc, ByteArrayOutputStream())
        doc.open()
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(top = 10f, right = 10f, bottom = 10f, left = 10f),
                    ),
            )
        return RenderContext(
            document = doc,
            writer = writer,
            template = template,
            data = emptyMap(),
            config = config,
            containerWidth = 500f,
            containerHeight = 800f,
            renderState = renderState,
            bodyOffsetY = 10f,
        )
    }

    @Test
    fun `test isRelativeFlow`() {
        val relText = TextElement(id = "t1", x = 0f, y = 0f, positionMode = PositionMode.RELATIVE)
        val absText = TextElement(id = "t2", x = 0f, y = 0f, positionMode = PositionMode.ABSOLUTE)
        val container = ContainerElement(id = "c1", x = 0f, y = 0f, elements = emptyList())

        assertTrue(orchestrator.isRelativeFlow(relText))
        assertTrue(orchestrator.isRelativeFlow(container))
        assertFalse(orchestrator.isRelativeFlow(absText))
    }

    @Test
    fun `test calculateEffectiveY`() {
        val absText = TextElement(id = "t1", x = 10f, y = 50f)
        assertEquals(50f, orchestrator.calculateEffectiveY(absText, false, 100f))

        val relText = TextElement(id = "t2", x = 0f, y = 0f, relativeOffsetY = 15f)
        assertEquals(115f, orchestrator.calculateEffectiveY(relText, true, 100f))

        val relRect100 = RectangleElement(id = "r1", x = 0f, y = 0f, width = 100f, height = "100%", relativeOffsetY = 20f)
        assertEquals(100f, orchestrator.calculateEffectiveY(relRect100, true, 100f))
    }

    @Test
    fun `test calculateSummaryEffectiveY`() {
        val absElem = TextElement(id = "t1", x = 0f, y = 40f)
        assertEquals(40f, orchestrator.calculateSummaryEffectiveY(absElem, false, 100f))

        val relElem = TextElement(id = "t2", x = 0f, y = 20f, relativeOffsetY = 10f)
        // when summaryFlowY == 0, uses element.y if > 0
        assertEquals(20f, orchestrator.calculateSummaryEffectiveY(relElem, true, 0f))
        // when summaryFlowY > 0
        assertEquals(60f, orchestrator.calculateSummaryEffectiveY(relElem, true, 50f))

        val rel100 = RectangleElement(id = "r1", x = 0f, y = 0f, width = 100f, height = "100%", relativeOffsetY = 15f)
        assertEquals(0f, orchestrator.calculateSummaryEffectiveY(rel100, true, 0f))
    }

    @Test
    fun `test buildGroupIndex`() {
        assertEquals(emptyMap(), orchestrator.buildGroupIndex(null))
        assertEquals(emptyMap(), orchestrator.buildGroupIndex(emptyList()))

        val group1 = ElementGroup(id = "g1", name = "Group 1", elementIds = listOf("e1", "e2"))
        val index = orchestrator.buildGroupIndex(listOf(group1))
        assertEquals(group1, index["e1"])
        assertEquals(group1, index["e2"])
        assertFalse(index.containsKey("e3"))
    }

    @Test
    fun `test shouldRenderElement`() {
        val data = mapOf("visible" to true, "hidden" to false)

        val groupHidden = ElementGroup(id = "gh", name = "H", elementIds = listOf("e1"), printCondition = "\${hidden}")
        val groupIndex = orchestrator.buildGroupIndex(listOf(groupHidden))

        val elem1 = TextElement(id = "e1", x = 0f, y = 0f)
        assertFalse(orchestrator.shouldRenderElement(elem1, groupIndex, data))

        val elemWithCond = TextElement(id = "e2", x = 0f, y = 0f, printCondition = "\${visible}")
        assertTrue(orchestrator.shouldRenderElement(elemWithCond, emptyMap(), data))

        val elemWithCondFalse = TextElement(id = "e3", x = 0f, y = 0f, printCondition = "\${hidden}")
        assertFalse(orchestrator.shouldRenderElement(elemWithCondFalse, emptyMap(), data))

        val staticElem = StaticTextElement(id = "st1", x = 0f, y = 0f, value = "Static")
        assertNull(staticElem.printCondition)
        assertTrue(orchestrator.shouldRenderElement(staticElem, emptyMap(), data))
    }

    @Test
    fun `test registries and facade image cache delegation`() {
        PDFGenerator.setMaxImageCacheSize(50)
        PDFGenerator.clearImageCache()
        assertEquals(0, PDFGenerator.imageCacheSize())

        ElementDeserializer.registerType("text_alias", TextElement::class.java)
        val localEngine = RenderEngine(config)
        var customRendered = false
        localEngine.registerRenderer(
            StaticTextElement::class,
            object : Renderer<StaticTextElement> {
                override fun render(
                    element: StaticTextElement,
                    context: RenderContext,
                ) {
                    customRendered = true
                }
            },
        )
        localEngine.render(StaticTextElement(id = "s", x = 0f, y = 0f, value = "v"), createDummyContext())
        assertTrue(customRendered)
    }

    @Test
    fun `test shouldAutoPageBreak`() {
        val elem = TextElement(id = "t1", x = 0f, y = 0f)
        val pb = PageBreakElement(id = "pb")

        assertFalse(orchestrator.shouldAutoPageBreak(elem, 100f, 50f, null))
        assertFalse(orchestrator.shouldAutoPageBreak(elem, 100f, 50f, 0f))
        assertFalse(orchestrator.shouldAutoPageBreak(pb, 850f, 0f, 800f))

        // Within container bounds
        assertFalse(orchestrator.shouldAutoPageBreak(elem, 500f, 100f, 800f))

        // Exceeds container bounds
        assertTrue(orchestrator.shouldAutoPageBreak(elem, 750f, 100f, 800f))
    }

    @Test
    fun `test advanceCurrentY`() {
        val renderState = RenderState()
        val context = createDummyContext(renderState)
        val data = emptyMap<String, Any?>()

        val text = TextElement(id = "t1", x = 0f, y = 0f, height = 30f)
        orchestrator.advanceCurrentY(text, 10f, renderState, context, data)
        assertEquals(40f, renderState.currentY)

        val table = TableElement(id = "tbl", x = 0f, y = 0f, width = 100f, dataBinding = "items", columns = emptyList())
        orchestrator.advanceCurrentY(table, 10f, renderState, context, data)
        // should not advance currentY for table
        assertEquals(40f, renderState.currentY)
    }

    @Test
    fun `test renderBodyElements and renderSummaryPage`() {
        val renderState = RenderState()
        val context = createDummyContext(renderState)
        val data = mapOf("showSummary" to true)

        val elements =
            listOf(
                TextElement(id = "t1", x = 0f, y = 0f, value = "First Line", height = 20f, positionMode = PositionMode.RELATIVE),
                TextElement(id = "t2", x = 0f, y = 0f, value = "Second Line", height = 25f, positionMode = PositionMode.RELATIVE),
            )

        orchestrator.renderBodyElements(elements, null, context, data)
        assertTrue(renderState.currentY >= 45f)

        val summaryPage =
            SummaryPage(
                printCondition = "\${showSummary}",
                background = BodyBackground(elements = listOf(RectangleElement(id = "s_bg", x = 0f, y = 0f, width = 100f, height = 100f))),
                elements = listOf(TextElement(id = "st1", x = 0f, y = 0f, value = "Summary Content", height = 20f)),
            )

        orchestrator.renderSummaryPage(summaryPage, context, data)
    }
}
