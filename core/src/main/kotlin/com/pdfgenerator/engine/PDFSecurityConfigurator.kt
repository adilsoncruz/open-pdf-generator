package com.pdfgenerator.engine

import org.openpdf.text.pdf.PdfWriter
import org.slf4j.LoggerFactory

data class PDFSecurityConfig(
    val userPassword: String? = null,
    val ownerPassword: String? = null,
    val permissions: Int = DEFAULT_PERMISSIONS,
    val encryptionType: Int = PdfWriter.STANDARD_ENCRYPTION_128,
) {
    val isConfigured: Boolean
        get() = userPassword != null || ownerPassword != null || permissions != DEFAULT_PERMISSIONS

    companion object {
        const val DEFAULT_PERMISSIONS = PdfWriter.ALLOW_PRINTING or PdfWriter.ALLOW_COPY
    }
}

class PDFSecurityConfigurator(
    private val securityConfig: PDFSecurityConfig? = null,
) {
    private val logger = LoggerFactory.getLogger(PDFSecurityConfigurator::class.java)

    fun configure(writer: PdfWriter) {
        val config = securityConfig ?: return
        if (!config.isConfigured) return

        logger.debug(
            "Applying PDF security: encryptionType={}, permissions={}",
            config.encryptionType,
            config.permissions,
        )
        val userBytes = config.userPassword?.toByteArray()
        val ownerBytes = (config.ownerPassword ?: config.userPassword)?.toByteArray()
        try {
            writer.setEncryption(userBytes, ownerBytes, config.permissions, config.encryptionType)
        } catch (e: NoClassDefFoundError) {
            logger.warn("BouncyCastle not available on classpath, skipping encryption: ${e.message}")
        }
    }

    companion object {
        private val logger = LoggerFactory.getLogger(PDFSecurityConfigurator::class.java)

        fun applySecurity(
            writer: PdfWriter,
            userPassword: String? = null,
            ownerPassword: String? = null,
            permissions: Int = PDFSecurityConfig.DEFAULT_PERMISSIONS,
            encryptionType: Int = PdfWriter.STANDARD_ENCRYPTION_128,
        ) {
            val userBytes = userPassword?.toByteArray()
            val ownerBytes = (ownerPassword ?: userPassword)?.toByteArray()
            if (userBytes != null || ownerBytes != null) {
                try {
                    writer.setEncryption(userBytes, ownerBytes, permissions, encryptionType)
                } catch (e: NoClassDefFoundError) {
                    logger.warn("BouncyCastle not available on classpath, skipping encryption: ${e.message}")
                }
            }
        }
    }
}
