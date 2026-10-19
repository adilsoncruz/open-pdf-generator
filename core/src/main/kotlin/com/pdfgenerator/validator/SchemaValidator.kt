package com.pdfgenerator.validator

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.networknt.schema.JsonSchema
import com.networknt.schema.JsonSchemaFactory
import com.networknt.schema.SpecVersion
import com.networknt.schema.SpecVersionDetector
import com.pdfgenerator.api.SchemaValidationError

object SchemaValidator {
    private val objectMapper = ObjectMapper()

    fun validate(
        schema: Map<String, Any?>,
        data: Map<String, Any?>,
    ): List<SchemaValidationError> {
        val schemaNode = objectMapper.valueToTree<JsonNode>(schema)
        val dataNode = objectMapper.valueToTree<JsonNode>(data)
        return validate(schemaNode, dataNode)
    }

    fun validate(
        schemaJson: String,
        dataJson: String,
    ): List<SchemaValidationError> {
        val schemaNode = objectMapper.readTree(schemaJson)
        val dataNode = objectMapper.readTree(dataJson)
        return validate(schemaNode, dataNode)
    }

    fun validate(
        schemaNode: JsonNode,
        dataNode: JsonNode,
    ): List<SchemaValidationError> {
        val jsonSchema = getJsonSchema(schemaNode)
        val messages = jsonSchema.validate(dataNode)
        return messages.map { msg ->
            SchemaValidationError(
                path = msg.instanceLocation.toString(),
                message = msg.message,
                keyword = msg.type,
            )
        }
    }

    fun validateSchema(schema: Map<String, Any?>) {
        val schemaNode = objectMapper.valueToTree<JsonNode>(schema)
        validateSchemaNode(schemaNode)
    }

    fun validateSchema(schemaJson: String) {
        val schemaNode = objectMapper.readTree(schemaJson)
        validateSchemaNode(schemaNode)
    }

    private fun validateSchemaNode(schemaNode: JsonNode) {
        val version =
            SpecVersionDetector.detectOptionalVersion(schemaNode, false)
                .orElse(SpecVersion.VersionFlag.V7)
        val factory = JsonSchemaFactory.getInstance(version)
        val jsonSchema = factory.getSchema(schemaNode)
        jsonSchema.initializeValidators()

        val metaSchema = factory.getSchema(com.networknt.schema.SchemaLocation.of(version.id))
        val errors = metaSchema.validate(schemaNode)
        if (errors.isNotEmpty()) {
            throw IllegalArgumentException("Schema does not conform to meta-schema: " + errors.joinToString { it.message })
        }
    }

    private fun getJsonSchema(schemaNode: JsonNode): JsonSchema {
        val version =
            SpecVersionDetector.detectOptionalVersion(schemaNode, false)
                .orElse(SpecVersion.VersionFlag.V7)
        val factory = JsonSchemaFactory.getInstance(version)
        return factory.getSchema(schemaNode)
    }
}
