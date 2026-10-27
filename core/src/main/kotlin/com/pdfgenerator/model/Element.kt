package com.pdfgenerator.model

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

sealed interface Element {
    val type: String
    val id: String
    public val x: Float
    public val y: Float
    val positionMode: PositionMode?
    val relativeOffsetY: Float?

    fun validate(pageSettings: PageSettings): List<ValidationError>
}

class ElementDeserializer : JsonDeserializer<Element> {
    companion object {
        private val gson: Gson by lazy {
            GsonBuilder()
                .registerTypeAdapter(Element::class.java, ElementDeserializer())
                .registerTypeAdapter(PositionMode::class.java, PositionModeTypeAdapter())
                .create()
        }
    }

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext,
    ): Element {
        val jsonObject = json.asJsonObject
        val type =
            jsonObject.get("type")?.asString
                ?: throw IllegalArgumentException("Element must have a 'type' field")

        return when (type) {
            "text" -> gson.fromJson(json, TextElement::class.java)
            "static_text", "staticText" -> gson.fromJson(json, StaticTextElement::class.java)
            "image" -> gson.fromJson(json, ImageElement::class.java)
            "table" -> gson.fromJson(json, TableElement::class.java)
            "rectangle" -> gson.fromJson(json, RectangleElement::class.java)
            "line" -> gson.fromJson(json, LineElement::class.java)
            "barcode", "qrcode" -> gson.fromJson(json, BarcodeElement::class.java)
            "conditional" -> gson.fromJson(json, ConditionalElement::class.java)
            "loop" -> gson.fromJson(json, LoopElement::class.java)
            "container" -> gson.fromJson(json, ContainerElement::class.java)
            "page_break", "pageBreak" -> gson.fromJson(json, PageBreakElement::class.java)
            "spacer" -> gson.fromJson(json, SpacerElement::class.java)
            "rich_text", "richText" -> gson.fromJson(json, RichTextElement::class.java)
            "link" -> gson.fromJson(json, LinkElement::class.java)
            else -> throw IllegalArgumentException("Unknown element type: $type")
        }
    }
}
