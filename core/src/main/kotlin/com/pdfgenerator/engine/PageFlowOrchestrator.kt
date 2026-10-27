package com.pdfgenerator.engine

import com.pdfgenerator.api.PDFGenerationException
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SummaryPage
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ConditionEvaluator
import org.slf4j.LoggerFactory

class PageFlowOrchestrator(
    private val renderEngine: RenderEngine,
    private val config: PDFGeneratorConfig,
) {
    private val logger = LoggerFactory.getLogger(PageFlowOrchestrator::class.java)

    fun renderBodyElements(
        elements: List<Element>,
        groups: List<ElementGroup>?,
        context: RenderContext,
        data: Map<String, Any?>,
    ) {
        val pageGroupIndex = buildGroupIndex(groups)
        val renderState = context.renderState ?: RenderState()

        elements.forEach { element ->
            try {
                if (shouldRenderElement(element, pageGroupIndex, data)) {
                    val isRelative = isRelativeFlow(element)
                    val effectiveY = calculateEffectiveY(element, isRelative, renderState.currentY)

                    val renderContext =
                        if (isRelative) {
                            context.copy(offsetY = context.bodyOffsetY + (effectiveY - element.y))
                        } else {
                            context
                        }

                    renderEngine.render(element, renderContext)

                    advanceCurrentY(element, effectiveY, renderState, context, data)
                }
            } catch (e: Exception) {
                logger.error("Erro ao renderizar elemento ${element.id}: ${e.message}", e)
                if (config.strictMode) {
                    throw PDFGenerationException("Erro ao renderizar elemento ${element.id}", e)
                }
            }
        }
    }

    fun advanceCurrentY(
        element: Element,
        effectiveY: Float,
        renderState: RenderState,
        context: RenderContext,
        data: Map<String, Any?>,
    ) {
        if (element !is LoopElement && element !is TableElement) {
            val elementHeight = ElementHeightCalculator.getElementHeight(element, data, context)
            renderState.updateMaxY(effectiveY + elementHeight)
        }
    }

    fun shouldAutoPageBreak(
        element: Element,
        effectiveY: Float,
        elementHeight: Float,
        containerHeight: Float?,
        hasRenderedContent: Boolean = true,
    ): Boolean {
        if (containerHeight == null || containerHeight <= 0f) return false
        if (element is PageBreakElement) return false
        return hasRenderedContent && (effectiveY + elementHeight > containerHeight)
    }

    fun renderSummaryPage(
        summaryPage: SummaryPage,
        context: RenderContext,
        data: Map<String, Any?>,
    ) {
        val summaryCondition = summaryPage.printCondition
        if (summaryCondition != null && !ConditionEvaluator.evaluate(summaryCondition, data, null)) {
            return
        }

        val document = context.document
        val writer = context.writer
        val margins = context.template.pageSettings.margins

        document.newPage()
        writer.pageEvent = null

        val summaryOffsetX = margins.left
        val summaryOffsetY = margins.top
        val summaryContainerWidth = document.pageSize.width - margins.left - margins.right
        val summaryContainerHeight = document.pageSize.height - margins.top - margins.bottom

        val summaryContext =
            context.copy(
                isSummaryPage = true,
                containerWidth = summaryContainerWidth,
                containerHeight = summaryContainerHeight,
                offsetX = summaryOffsetX,
                offsetY = summaryOffsetY,
                bodyOffsetY = summaryOffsetY,
            )

        summaryPage.background?.let { bg ->
            val summaryBackgroundGroupIndex = buildGroupIndex(bg.groups)
            bg.elements.forEach { element ->
                try {
                    if (shouldRenderElement(element, summaryBackgroundGroupIndex, data)) {
                        renderEngine.render(
                            element,
                            summaryContext.copy(useContentUnder = true),
                        )
                    }
                } catch (e: Exception) {
                    logger.error(
                        "Erro ao renderizar background da summary ${element.id}: ${e.message}",
                        e,
                    )
                }
            }
        }

        val summaryGroupIndex = buildGroupIndex(summaryPage.groups)
        var summaryFlowY = 0f

        summaryPage.elements.forEach { element ->
            try {
                if (shouldRenderElement(element, summaryGroupIndex, data)) {
                    val isRelative = isRelativeFlow(element)
                    val effectiveY = calculateSummaryEffectiveY(element, isRelative, summaryFlowY)

                    val renderContext =
                        if (isRelative) {
                            summaryContext.copy(offsetY = summaryContext.offsetY + (effectiveY - element.y))
                        } else {
                            summaryContext
                        }

                    renderEngine.render(element, renderContext)
                    val elementHeight = ElementHeightCalculator.getElementHeight(element, data, renderContext)
                    if (isRelative) {
                        summaryFlowY = effectiveY + elementHeight
                    } else {
                        summaryFlowY = kotlin.math.max(summaryFlowY, element.y + elementHeight)
                    }
                }
            } catch (e: Exception) {
                logger.error("Erro ao renderizar elemento da summary ${element.id}: ${e.message}", e)
                if (config.strictMode) {
                    throw PDFGenerationException(
                        "Erro ao renderizar elemento da summary ${element.id}",
                        e,
                    )
                }
            }
        }
    }

    fun isRelativeFlow(element: Element): Boolean {
        return element.positionMode == PositionMode.RELATIVE || element is ContainerElement
    }

    fun calculateEffectiveY(
        element: Element,
        isRelativeFlow: Boolean,
        currentY: Float,
    ): Float {
        return if (isRelativeFlow) {
            val isHeightFull =
                when (element) {
                    is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                    is ContainerElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                    else -> false
                }
            val offsetY = if (isHeightFull) 0f else (element.relativeOffsetY ?: 0f)
            currentY + offsetY
        } else {
            element.y
        }
    }

    fun calculateSummaryEffectiveY(
        element: Element,
        isRelativeFlow: Boolean,
        summaryFlowY: Float,
    ): Float {
        return if (isRelativeFlow) {
            val isHeightFull =
                when (element) {
                    is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                    is ContainerElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                    else -> false
                }
            val offsetY = if (isHeightFull) 0f else (element.relativeOffsetY ?: 0f)
            if (summaryFlowY == 0f) {
                if (isHeightFull) {
                    0f
                } else if (element.y > 0f) {
                    element.y
                } else {
                    offsetY
                }
            } else {
                summaryFlowY + offsetY
            }
        } else {
            element.y
        }
    }

    fun buildGroupIndex(groups: List<ElementGroup>?): Map<String, ElementGroup> {
        if (groups.isNullOrEmpty()) {
            return emptyMap()
        }

        val groupIndex = HashMap<String, ElementGroup>()
        groups.forEach { group ->
            group.elementIds.forEach { elementId ->
                groupIndex.putIfAbsent(elementId, group)
            }
        }

        return groupIndex
    }

    fun shouldRenderElement(
        element: Element,
        groupIndex: Map<String, ElementGroup>,
        data: Map<String, Any?>,
    ): Boolean {
        val group = groupIndex[element.id]

        if (group != null && group.printCondition != null) {
            val shouldRenderGroup = ConditionEvaluator.evaluate(group.printCondition, data)
            if (!shouldRenderGroup) {
                logger.debug("Elemento ${element.id} SKIPPED (grupo '${group.name}' printCondition='${group.printCondition}' = false)")
                return false
            }
        }

        val elementCondition =
            when (element) {
                is ContainerElement -> element.printCondition
                is TextElement -> element.printCondition
                is BarcodeElement -> element.printCondition
                is LoopElement -> element.printCondition
                is PageBreakElement -> element.printCondition
                is RichTextElement -> element.printCondition
                is LinkElement -> element.printCondition
                else -> null
            }

        if (elementCondition != null) {
            val shouldRenderElement = ConditionEvaluator.evaluate(elementCondition, data)
            if (!shouldRenderElement) {
                logger.debug("Elemento ${element.id} SKIPPED (printCondition='$elementCondition' = false)")
                return false
            }
        }

        return true
    }
}
