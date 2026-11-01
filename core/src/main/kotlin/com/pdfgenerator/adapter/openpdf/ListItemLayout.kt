package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RectangleStyle
import com.pdfgenerator.model.TextStyle

/**
 * Shared measurement and painting helpers for [ListRenderer] and [CheckListRenderer].
 *
 * Both elements render one row per data entry and need the same multiline measurement,
 * page-break detection and row background behaviour.
 */
internal object ListItemLayout {
    fun contentHeight(
        text: String,
        boxWidth: Float,
        style: TextStyle?,
    ): Float {
        val overflow = style?.overflow?.lowercase() ?: "visible"
        val definedHeight = style?.fontSize ?: 12f
        if (overflow == "auto" && style?.multiline == true) {
            return TextRenderer.calculateContentHeight(
                text = text,
                boxWidth = boxWidth,
                fontSize = style.fontSize,
                lineHeight = style.lineHeight,
                paddingTop = style.paddingTop,
                paddingBottom = style.paddingBottom,
                paddingLeft = style.paddingLeft,
                paddingRight = style.paddingRight,
                firstLineIndent = style.firstLineIndent,
                fontFamily = style.fontFamily,
            )
        }
        return definedHeight
    }

    fun rowStyle(style: TextStyle?): TextStyle =
        style?.copy(
            firstLineIndent = 0f,
            multiline = true,
            overflow = "auto",
            paddingLeft = 0f,
            paddingRight = 0f,
            paddingTop = 0f,
            paddingBottom = 0f,
            backgroundColor = "transparent",
        ) ?: TextStyle(multiline = true, overflow = "auto")

    fun renderRowBackground(
        renderEngine: RenderEngine,
        context: RenderContext,
        elementId: String,
        index: Int,
        x: Float,
        width: Float,
        rowY: Float,
        rowHeight: Float,
        backgroundColor: String,
    ) {
        val background =
            RectangleElement(
                id = "$elementId-background-$index",
                x = x,
                y = rowY,
                width = width,
                height = rowHeight,
                positionMode = PositionMode.RELATIVE,
                style =
                    RectangleStyle(
                        borderWidth = 0f,
                        fillColor = backgroundColor,
                    ),
            )
        renderEngine.render(background, context)
    }

    fun isVisibleBackground(color: String?): Boolean = !color.isNullOrBlank() && color.lowercase() != "transparent"
}
