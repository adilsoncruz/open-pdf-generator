package com.pdfgenerator.renderer

import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.ImageElement
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.openpdf.text.Document
import org.openpdf.text.PageSize
import java.io.File
import java.util.Base64

class ImageRendererCoverageTest {
    private lateinit var document: Document
    private lateinit var context: RenderContext

    @BeforeEach
    fun setUp() {
        document = mockk(relaxed = true)
        every { document.pageSize } returns PageSize.A4

        context = mockk(relaxed = true)
        every { context.document } returns document
        every { context.data } returns emptyMap()
        every { context.loopContext } returns null
        every { context.resolveX(any()) } answers { firstArg() }
        every { context.resolveY(any()) } answers { firstArg() }
        ImageRenderer.clearCache()
        ImageRenderer.setMaxCacheSize(100)
    }

    @AfterEach
    fun tearDown() {
        ImageRenderer.clearCache()
    }

    private fun createBase64Gif(): String {
        // A minimal valid 1x1 transparent GIF
        val gifBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        return "data:image/gif;base64,$gifBase64"
    }

    private fun getGifBytes(): ByteArray {
        return Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
    }

    @Test
    fun `test cache companion methods`() {
        val tempFile = File.createTempFile("testimg", ".gif")
        tempFile.writeBytes(getGifBytes())

        ImageRenderer.preloadFromFiles(tempFile.absolutePath, "non-existent.png")
        assertEquals(1, ImageRenderer.cacheSize())

        ImageRenderer.preloadFromClasspath("does-not-exist.png")
        assertEquals(1, ImageRenderer.cacheSize())

        ImageRenderer.invalidateCache(tempFile.absolutePath)
        assertEquals(0, ImageRenderer.cacheSize())

        ImageRenderer.setMaxCacheSize(1)
        tempFile.delete()
    }

    @Test
    fun `test empty source and print condition`() {
        val config = PDFGeneratorConfig()
        val renderer = ImageRenderer(config)

        val el1 = ImageElement(id = "img1", x = 0f, y = 0f, width = 100f, height = 100f, printCondition = "1 == 2", source = "abc")
        renderer.render(el1, context) // Should return early

        val el2 = ImageElement(id = "img2", x = 0f, y = 0f, width = 100f, height = 100f, source = "")
        renderer.render(el2, context) // Should return early
    }

    @Test
    fun `test base64 and data binding`() {
        val config = PDFGeneratorConfig()
        val renderer = ImageRenderer(config)

        every { context.data } returns mapOf("myImage" to createBase64Gif())

        val el =
            ImageElement(id = "img3", x = 0f, y = 0f, width = 100f, height = 100f, dataBinding = "myImage", source = "will-be-overridden")
        renderer.render(el, context)
        verify(exactly = 1) { document.add(any()) }
    }

    @Test
    fun `test http remote image`() {
        // Instead of making real http call, let it fail with strictMode = false to cover exception handling
        val config = PDFGeneratorConfig(strictMode = false)
        val renderer = ImageRenderer(config)
        val el =
            ImageElement(
                id = "img4",
                x = 0f,
                y = 0f,
                width = 100f,
                height = 100f,
                source = "http://invalid-url-that-does-not-exist.com/img.png",
            )
        renderer.render(el, context) // Should catch exception and not throw
    }

    @Test
    fun `test http remote image strict mode`() {
        val config = PDFGeneratorConfig(strictMode = true)
        val renderer = ImageRenderer(config)
        val el = ImageElement(id = "img4", x = 0f, y = 0f, width = 100f, height = 100f, source = "hxxp://invalid-url")
        assertThrows(Exception::class.java) {
            renderer.render(el, context)
        }
    }

    @Test
    fun `test file loading cache max size`() {
        val config = PDFGeneratorConfig(enableImageCache = true)
        val renderer = ImageRenderer(config)

        ImageRenderer.setMaxCacheSize(1) // Force eviction

        val temp1 = File.createTempFile("testimg1", ".gif")
        temp1.writeBytes(getGifBytes())
        val temp2 = File.createTempFile("testimg2", ".gif")
        temp2.writeBytes(getGifBytes())

        try {
            renderer.render(ImageElement(id = "t1", x = 0f, y = 0f, width = 10f, height = 10f, source = temp1.absolutePath), context)
            renderer.render(
                ImageElement(id = "t2", x = 0f, y = 0f, width = 10f, height = 10f, source = temp2.absolutePath),
                context,
            ) // should evict t1
            assertEquals(1, ImageRenderer.cacheSize())
        } finally {
            temp1.delete()
            temp2.delete()
        }
    }

    @Test
    fun `test scale modes`() {
        val config = PDFGeneratorConfig(enableImageCache = false)
        val renderer = ImageRenderer(config)

        val temp = File.createTempFile("testimg1", ".gif")
        temp.writeBytes(getGifBytes())

        try {
            renderer.render(
                ImageElement(id = "c1", x = 0f, y = 0f, width = 100f, height = 100f, source = temp.absolutePath, fit = "contain"),
                context,
            )
            renderer.render(
                ImageElement(id = "c2", x = 0f, y = 0f, width = 100f, height = 100f, source = temp.absolutePath, fit = "cover"),
                context,
            )
            renderer.render(
                ImageElement(id = "c3", x = 0f, y = 0f, width = 100f, height = 100f, source = temp.absolutePath, fit = "fill"),
                context,
            )
            renderer.render(
                ImageElement(id = "c4", x = 0f, y = 0f, width = 100f, height = 100f, source = temp.absolutePath, fit = "scale-down"),
                context,
            )
            renderer.render(
                ImageElement(id = "c5", x = 0f, y = 0f, width = 0f, height = 0f, source = temp.absolutePath, fit = "scale-down"),
                context,
            )
            renderer.render(
                ImageElement(id = "c6", x = 0f, y = 0f, width = 100f, height = 100f, source = temp.absolutePath, fit = "unknown"),
                context,
            )
        } finally {
            temp.delete()
        }
    }

    @Test
    fun `test load from classpath and resources dir`() {
        val config = PDFGeneratorConfig(enableImageCache = false, resourcesDirectory = File("/tmp"))
        val renderer = ImageRenderer(config)
        val temp = File("/tmp/some-test-img.gif")
        temp.writeBytes(getGifBytes())
        try {
            renderer.render(ImageElement(id = "r1", x = 0f, y = 0f, width = 100f, height = 100f, source = "some-test-img.gif"), context)
        } finally {
            temp.delete()
        }
    }

    @Test
    fun `test missing image throws`() {
        val config = PDFGeneratorConfig(strictMode = true, enableImageCache = true)
        val renderer = ImageRenderer(config)
        assertThrows(Exception::class.java) {
            renderer.render(ImageElement(id = "r1", x = 0f, y = 0f, width = 100f, height = 100f, source = "does-not-exist.png"), context)
        }
    }
}
