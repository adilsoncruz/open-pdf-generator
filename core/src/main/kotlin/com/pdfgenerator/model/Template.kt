package com.pdfgenerator.model

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import org.openpdf.text.PageSize
import org.openpdf.text.Rectangle
import java.io.File
import java.io.InputStream
import java.io.InputStreamReader

data class Template(
    val version: String,
    val metadata: TemplateMetadata = TemplateMetadata(),
    val pageSettings: PageSettings,
    val page: List<Element>? = null,
    val pageElements: List<Element>? = null,
    val groups: List<ElementGroup>? = null,
    val summaryPage: SummaryPage? = null,
    val schema: Map<String, Any?>? = null,
) {
    fun bodyElements(): List<Element> = page ?: pageElements ?: emptyList()

    companion object {
        private val gson: Gson =
            GsonBuilder()
                .registerTypeAdapter(Element::class.java, ElementDeserializer())
                .registerTypeAdapter(PositionMode::class.java, PositionModeTypeAdapter())
                .setPrettyPrinting()
                .create()

        fun fromFile(file: File): Template {
            return file.inputStream().use { fromInputStream(it) }
        }

        fun fromString(json: String): Template {
            return gson.fromJson(json, Template::class.java)
        }

        fun fromInputStream(input: InputStream): Template {
            return InputStreamReader(input).use { reader ->
                gson.fromJson(reader, Template::class.java)
            }
        }
    }

    fun validate(): ValidationResult {
        val errors = mutableListOf<ValidationError>()

        if (!version.matches(Regex("\\d+\\.\\d+"))) {
            errors.add(ValidationError("version", "Version must be in X.Y format"))
        }

        val elements = bodyElements()
        val ids = elements.map { it.id }
        val duplicateIds = ids.groupingBy { it }.eachCount().filter { it.value > 1 }.keys
        if (duplicateIds.isNotEmpty()) {
            errors.add(ValidationError("page", "Duplicate IDs: ${duplicateIds.joinToString(", ")}"))
        }

        elements.forEachIndexed { index, element ->
            val elementErrors = element.validate(pageSettings)
            elementErrors.forEach { error ->
                errors.add(ValidationError("page[$index].${error.path}", error.message))
            }
        }

        schema?.let {
            try {
                com.pdfgenerator.validator.SchemaValidator.validateSchema(it)
            } catch (e: Exception) {
                errors.add(ValidationError("schema", "Invalid schema definition: ${e.message}"))
            }
        }

        return ValidationResult(errors.isEmpty(), errors)
    }

    fun toJson(): String {
        return gson.toJson(this)
    }

    fun saveToFile(file: File) {
        file.parentFile?.mkdirs()
        file.writeText(toJson())
    }
}

data class TemplateMetadata(
    val name: String = "",
    val description: String = "",
    val author: String = "",
    val created: String = "",
    val modified: String = "",
    val tags: List<String> = emptyList(),
)

data class PageSettings(
    val size: String,
    val orientation: String,
    val margins: Margins,
    val customSize: CustomSize? = null,
    val header: HeaderFooter? = null,
    val footer: HeaderFooter? = null,
    val bodyBackground: BodyBackground? = null,
    val watermark: WatermarkConfig? = null,
    val showMargins: Boolean = false,
) {
    fun getPageSize(): Rectangle {
        val baseSize =
            when (size.uppercase()) {
                "A4" -> PageSize.A4
                "A3" -> PageSize.A3
                "A5" -> PageSize.A5
                "LETTER" -> PageSize.LETTER
                "LEGAL" -> PageSize.LEGAL
                "CUSTOM" ->
                    customSize?.let { Rectangle(it.width, it.height) }
                        ?: throw IllegalArgumentException("Custom size required when size is CUSTOM")
                else -> throw IllegalArgumentException("Unknown page size: $size")
            }

        return when (orientation.lowercase()) {
            "portrait" -> baseSize
            "landscape" -> baseSize.rotate()
            else -> throw IllegalArgumentException("Unknown orientation: $orientation")
        }
    }
}

data class Margins(
    val top: Float,
    val right: Float,
    val bottom: Float,
    val left: Float,
)

data class CustomSize(
    val width: Float,
    val height: Float,
)

data class SummaryPage(
    val elements: List<Element> = emptyList(),
    val groups: List<ElementGroup>? = null,
    val background: BodyBackground? = null,
    val printCondition: String? = null,
)

data class ValidationResult(
    val isValid: Boolean,
    val errors: List<ValidationError>,
)

data class ValidationError(
    val path: String,
    val message: String,
)
