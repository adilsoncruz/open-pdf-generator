package com.pdfgenerator.engine

import com.pdfgenerator.model.Element

interface Renderer<T : Element> {
    fun render(element: T, context: RenderContext)
}

