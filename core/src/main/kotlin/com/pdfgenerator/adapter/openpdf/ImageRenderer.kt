package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Image
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import org.slf4j.LoggerFactory
import java.io.File
import java.util.concurrent.ConcurrentHashMap

class ImageRenderer(private val config: PDFGeneratorConfig) : Renderer<ImageElement> {
    private val logger = LoggerFactory.getLogger(ImageRenderer::class.java)

    companion object {
        private val imageBytesCache = ConcurrentHashMap<String, ByteArray>()
        private var maxCacheSize = 100

        @JvmStatic
        fun clearCache() {
            imageBytesCache.clear()
        }

        @JvmStatic
        fun invalidateCache(imagePath: String) {
            imageBytesCache.remove(imagePath)
        }

        @JvmStatic
        fun cacheSize(): Int = imageBytesCache.size

        @JvmStatic
        fun setMaxCacheSize(size: Int) {
            maxCacheSize = size
        }

        @JvmStatic
        fun preloadFromClasspath(vararg resourcePaths: String) {
            resourcePaths.forEach { path ->
                tryLoadBytesFromClasspath(path)?.let { bytes ->
                    imageBytesCache[path] = bytes
                }
            }
        }

        @JvmStatic
        fun preloadFromFiles(vararg filePaths: String) {
            filePaths.forEach { path ->
                val file = File(path)
                if (file.exists() && file.isFile) {
                    imageBytesCache[path] = file.readBytes()
                }
            }
        }

        private fun tryLoadBytesFromClasspath(resourcePath: String): ByteArray? {
            val paths = listOf(resourcePath, "/$resourcePath", resourcePath.removePrefix("/"))

            for (path in paths) {
                val stream =
                    ImageRenderer::class.java.classLoader.getResourceAsStream(path)
                        ?: ImageRenderer::class.java.getResourceAsStream(path)

                if (stream != null) {
                    return stream.use { it.readBytes() }
                }
            }

            return null
        }
    }

    override fun render(
        element: ImageElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val imageSource = resolveImageSource(element, context)
        if (imageSource.isNullOrBlank()) {
            return
        }

        try {
            val image = loadImage(imageSource)
            scaleImage(image, element)

            val pageHeight = context.document.pageSize.height
            val yPosition = pageHeight - element.y - element.height

            image.setAbsolutePosition(element.x, yPosition)
            context.document.add(image)
        } catch (e: Exception) {
            logger.error("Erro ao carregar imagem ${element.id}: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        }
    }

    private fun resolveImageSource(
        element: ImageElement,
        context: RenderContext,
    ): String? {
        return when {
            element.dataBinding != null -> {
                val value = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)
                value?.toString()
            }
            else -> element.source
        }
    }

    private fun loadImage(source: String): Image {
        if (source.startsWith("data:image")) {
            val base64Data = source.substringAfter("base64,")
            val imageBytes = Base64.getDecoder().decode(base64Data)
            return Image.getInstance(imageBytes)
        }

        if (source.startsWith("http://") || source.startsWith("https://")) {
            return Image.getInstance(java.net.URI(source).toURL())
        }

        if (config.enableImageCache) {
            val bytes = getOrLoadBytes(source)
            return Image.getInstance(bytes)
        }

        return loadImageDirect(source)
    }

    private fun getOrLoadBytes(source: String): ByteArray {
        return imageBytesCache.getOrPut(source) {
            if (imageBytesCache.size >= maxCacheSize) {
                imageBytesCache.keys.firstOrNull()?.let {
                    imageBytesCache.remove(it)
                }
            }

            loadImageBytes(source)
        }
    }

    private fun loadImageBytes(source: String): ByteArray {
        Companion.tryLoadBytesFromClasspath(source)?.let { return it }

        val file = config.resourcesDirectory?.let { File(it, source) } ?: File(source)
        if (file.exists() && file.isFile) {
            return file.readBytes()
        }

        throw IllegalArgumentException("Image not found: $source")
    }

    private fun loadImageDirect(source: String): Image {
        Companion.tryLoadBytesFromClasspath(source)?.let { bytes ->
            return Image.getInstance(bytes)
        }

        val file = config.resourcesDirectory?.let { File(it, source) } ?: File(source)
        return Image.getInstance(file.absolutePath)
    }

    private fun scaleImage(
        image: Image,
        element: ImageElement,
    ) {
        val targetWidth = element.width
        val targetHeight = element.height

        when (element.getEffectiveFit().lowercase()) {
            "contain" -> {
                image.scaleToFit(targetWidth, targetHeight)
            }
            "cover" -> {
                val widthRatio = targetWidth / image.width
                val heightRatio = targetHeight / image.height
                val scale = maxOf(widthRatio, heightRatio)
                image.scalePercent(scale * 100)
            }
            "fill" -> {
                image.scaleAbsolute(targetWidth, targetHeight)
            }
            "scale-down" -> {
                if (image.width > targetWidth || image.height > targetHeight) {
                    image.scaleToFit(targetWidth, targetHeight)
                }
            }
            else -> {
                image.scaleToFit(targetWidth, targetHeight)
            }
        }
    }
}
