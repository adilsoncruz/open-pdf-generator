package com.pdfgenerator.model

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

enum class PositionMode {
    ABSOLUTE,
    RELATIVE,
}

class PositionModeTypeAdapter : JsonDeserializer<PositionMode?> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?,
    ): PositionMode? {
        if (json == null || json.isJsonNull) return null
        val value = json.asString.uppercase()
        return try {
            PositionMode.valueOf(value)
        } catch (e: IllegalArgumentException) {
            null
        }
    }
}
