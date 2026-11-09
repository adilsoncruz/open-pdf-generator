package com.pdfgenerator.model

data class BarcodeElement(
    override val type: String = "barcode",
    override val id: String,
    override val x: Float = 0f,
    override val y: Float = 0f,
    override val positionMode: PositionMode? = null,
    override val relativeOffsetY: Float? = null,
    val width: Float = 100f,
    val height: Float = 100f,
    val barcodeType: String? = "qrcode",
    val dataBinding: String? = "",
    val value: String? = null,
    val style: BarcodeStyle? = null,
    override val printCondition: String? = null,
) : Element {
    fun resolveWidth(containerWidth: Float): Float {
        return width
    }

    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        val errors = mutableListOf<ValidationError>()
        val supportedTypes =
            listOf(
                "qrcode", "qr_code",
                "barcode", "code128", "code_128",
                "code39", "code_39",
                "ean13", "ean_13",
                "ean8", "ean_8",
                "upc_a", "upca",
                "upc_e", "upce",
                "pdf417",
                "datamatrix", "data_matrix",
            )
        val effectiveType = (barcodeType ?: "qrcode").lowercase()
        if (effectiveType !in supportedTypes) {
            errors.add(
                ValidationError(
                    id,
                    "barcodeType deve ser um dos tipos suportados: qrcode, code128, code39, ean13, ean8, upc_a, upc_e, pdf417, datamatrix",
                ),
            )
        }
        return errors
    }
}

data class BarcodeStyle(
    val errorCorrection: String = "M",
)
