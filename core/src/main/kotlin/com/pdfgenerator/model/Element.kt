package com.pdfgenerator.model

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type
import java.util.concurrent.ConcurrentHashMap

sealed interface Element {
    val type: String
    val id: String
    public val x: Float
    public val y: Float
    val positionMode: PositionMode?
    val relativeOffsetY: Float?
    val printCondition: String?
        get() = null

    fun validate(pageSettings: PageSettings): List<ValidationError>
}

class ElementDeserializer : JsonDeserializer<Element> {
    companion object {
        private val typeRegistry: MutableMap<String, Class<out Element>> =
            ConcurrentHashMap(
                mapOf(
                    "text" to TextElement::class.java,
                    "static_text" to StaticTextElement::class.java,
                    "staticText" to StaticTextElement::class.java,
                    "image" to ImageElement::class.java,
                    "table" to TableElement::class.java,
                    "rectangle" to RectangleElement::class.java,
                    "line" to LineElement::class.java,
                    "barcode" to BarcodeElement::class.java,
                    "qrcode" to BarcodeElement::class.java,
                    "conditional" to ConditionalElement::class.java,
                    "loop" to LoopElement::class.java,
                    "container" to ContainerElement::class.java,
                    "spacer" to SpacerElement::class.java,
                    "rich_text" to RichTextElement::class.java,
                    "richText" to RichTextElement::class.java,
                    "link" to LinkElement::class.java,
                    "list" to ListElement::class.java,
                    "check_list" to CheckListElement::class.java,
                    "checkList" to CheckListElement::class.java,
                ),
            )

        @JvmStatic
        fun registerType(
            type: String,
            elementClass: Class<out Element>,
        ) {
            typeRegistry[type] = elementClass
        }

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

        val targetClass =
            typeRegistry[type]
                ?: throw IllegalArgumentException("Unknown element type: $type")

        return gson.fromJson(json, targetClass)
    }
}
