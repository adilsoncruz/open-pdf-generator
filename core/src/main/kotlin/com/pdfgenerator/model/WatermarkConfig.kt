package com.pdfgenerator.model

import com.google.gson.annotations.SerializedName

enum class WatermarkType {
    @SerializedName("text", alternate = ["TEXT"])
    TEXT,

    @SerializedName("image", alternate = ["IMAGE"])
    IMAGE,
}

data class WatermarkConfig(
    val type: WatermarkType = WatermarkType.TEXT,
    val text: String? = null,
    val dataBinding: String? = null,
    val imageSource: String? = null,
    val fontName: String = "Helvetica",
    val fontSize: Float = 60f,
    val fontStyle: String = "bold",
    val color: String = "#CCCCCC",
    val opacity: Float = 0.2f,
    val rotation: Float = 45f,
    val width: Float? = null,
    val height: Float? = null,
    val onTop: Boolean = false,
    val repeat: Boolean = false,
    val spacingX: Float? = null,
    val spacingY: Float? = null,
    val printCondition: String? = null,
)
