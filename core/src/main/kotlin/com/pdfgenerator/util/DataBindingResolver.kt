package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext
import java.util.concurrent.ConcurrentHashMap

object DataBindingResolver {
    
    private val pathCache = ConcurrentHashMap<String, List<String>>()
    
    fun resolve(binding: String, data: Map<String, Any?>, loopContext: LoopContext? = null): Any? {
        if (binding.startsWith("$")) {
            return resolveLoopVariable(binding, loopContext)
        }
        
        if (binding == "loopIndex" && loopContext != null) {
            return loopContext.index
        }
        
        if (loopContext != null) {
            val itemValue = resolveFromLoopItem(binding, loopContext)
            if (itemValue != null) {
                return itemValue
            }
        }
        
        return resolvePath(binding, data)
    }
    
    private fun resolveFromLoopItem(binding: String, loopContext: LoopContext): Any? {
        val item = loopContext.item
        if (item !is Map<*, *>) return null
        
        @Suppress("UNCHECKED_CAST")
        val itemMap = item.mapKeys { it.key.toString() } as Map<String, Any?>
        return resolvePath(binding, itemMap)
    }
    
    private fun resolveLoopVariable(binding: String, loopContext: LoopContext?): Any? {
        if (loopContext == null) {
            return null
        }
        
        return when {
            binding == "\$index" -> loopContext.index
            binding.startsWith("\$item.") -> {
                val path = binding.removePrefix("\$item.")
                when (val item = loopContext.item) {
                    is Map<*, *> -> resolvePath(path, item.mapKeys { it.key.toString() })
                    else -> null
                }
            }
            binding == "\$item" -> loopContext.item
            else -> null
        }
    }
    
    private fun resolvePath(path: String, data: Map<String, Any?>): Any? {
        val parts = pathCache.getOrPut(path) { path.split(".") }
        var current: Any? = data
        
        for (part in parts) {
            current = when (val curr = current) {
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
