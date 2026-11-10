package io.pdfgenerator.cli

import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class MainTest {

    @Test
    fun testPdfGeneratorCliRun() {
        assertDoesNotThrow {
            PdfGeneratorCli().parse(emptyList())
        }
    }

    @Test
    fun testApplyCliLogLevel() {
        assertDoesNotThrow {
            applyCliLogLevel(true)
            applyCliLogLevel(false)
        }
    }

    @Test
    fun testMainVersionAndHelp() {
        val originalOut = System.out
        try {
            System.setOut(PrintStream(ByteArrayOutputStream()))
            assertDoesNotThrow {
                main(arrayOf("version"))
                main(arrayOf("cache", "clear", "-t"))
                main(arrayOf("cache", "clear", "-i"))
            }
        } finally {
            System.setOut(originalOut)
        }
    }
}
