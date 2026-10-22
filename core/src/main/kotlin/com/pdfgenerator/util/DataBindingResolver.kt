package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext
import java.util.concurrent.ConcurrentHashMap

object DataBindingResolver {
    private val pathCache = ConcurrentHashMap<String, List<String>>()

    fun resolve(
        binding: String,
        data: Map<String, Any?>,
        loopContext: LoopContext? = null,
    ): Any? {
        val trimmed = binding.trim()
        val cleanBinding = when {
            trimmed.startsWith("\${") && trimmed.endsWith("}") ->
                trimmed.substring(2, trimmed.length - 1).trim()
            trimmed.startsWith("{{") && trimmed.endsWith("}}") ->
                trimmed.substring(2, trimmed.length - 2).trim()
            else -> trimmed
        }

        if (cleanBinding.startsWith("$")) {
            return resolveLoopVariable(cleanBinding, loopContext)
        }

        if (cleanBinding == "loopIndex" && loopContext != null) {
            return loopContext.index
        }

        if (loopContext != null) {
            val itemValue = resolveFromLoopItem(cleanBinding, loopContext)
            if (itemValue != null) {
                return itemValue
            }
        }

        val resolved = resolvePath(cleanBinding, data)
        if (resolved != null) {
            return resolved
        }

        if (cleanBinding == "pageNumber" || cleanBinding == "page") {
            return resolvePath("_pageNumber", data)
        }

        return null
    }


    private fun resolveFromLoopItem(
        binding: String,
        loopContext: LoopContext,
    ): Any? {
        val itemMap = loopContext.normalizedItemMap ?: normalizeLoopItemMap(loopContext.item) ?: return null
        return resolvePath(binding, itemMap)
    }

    private fun resolveLoopVariable(
        binding: String,
        loopContext: LoopContext?,
    ): Any? {
        if (loopContext == null) {
            return null
        }

        return when {
            binding == "\$index" -> loopContext.index
            binding.startsWith("\$item.") -> {
                val path = binding.removePrefix("\$item.")
                when (val item = loopContext.item) {
                    is Map<*, *> -> {
                        val itemMap = loopContext.normalizedItemMap ?: normalizeLoopItemMap(item) ?: return null
                        resolvePath(path, itemMap)
                    }
                    else -> null
                }
            }
            binding == "\$item" -> loopContext.item
            else -> null
        }
    }

    private fun normalizeLoopItemMap(item: Any?): Map<String, Any?>? {
        if (item !is Map<*, *>) return null

        @Suppress("UNCHECKED_CAST")
        return item.mapKeys { it.key.toString() } as Map<String, Any?>
    }

    private fun resolvePath(
        path: String,
        data: Map<String, Any?>,
    ): Any? {
        val parts = pathCache.getOrPut(path) { path.split(".") }
        var current: Any? = data

        for (part in parts) {
            current =
                when (val curr = current) {
                    is Map<*, *> -> curr[part]
                    is List<*> -> {
                        when (part) {
                            "length", "size" -> curr.size
                            else -> {
                                part.toIntOrNull()?.let { index ->
                                    if (index >= 0 && index < curr.size) curr[index] else null
                                }
                            }
                        }
                    }
                    is Array<*> -> {
                        when (part) {
                            "length", "size" -> curr.size
                            else -> {
                                part.toIntOrNull()?.let { index ->
                                    if (index >= 0 && index < curr.size) curr[index] else null
                                }
                            }
                        }
                    }
                    else -> return null
                }

            if (current == null) return null
        }

        return current
    }

    fun clearCache() {
        pathCache.clear()
    }

    fun cacheSize(): Int = pathCache.size
}
