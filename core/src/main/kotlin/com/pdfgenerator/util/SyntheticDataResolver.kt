package com.pdfgenerator.util

private const val PAGE_NUMBER_KEY = "_pageNumber"

fun withSyntheticPageNumber(
    data: Map<String, Any?>,
    pageNumber: Int,
): Map<String, Any?> = OverlayDataMap(data, mapOf(PAGE_NUMBER_KEY to pageNumber))

fun withSyntheticBindings(
    data: Map<String, Any?>,
    bindings: Map<String, Any?>,
): Map<String, Any?> =
    if (bindings.isEmpty()) {
        data
    } else {
        OverlayDataMap(data, bindings)
    }

private class OverlayDataMap(
    private val base: Map<String, Any?>,
    private val overrides: Map<String, Any?>,
) : AbstractMap<String, Any?>() {
    private val overrideOnlyKeys = overrides.keys - base.keys

    override val entries: Set<Map.Entry<String, Any?>>
        get() {
            val result = LinkedHashSet<Map.Entry<String, Any?>>(size)

            base.entries.forEach { entry ->
                result.add(MapEntry(entry.key, overrides[entry.key] ?: entry.value))
            }

            overrideOnlyKeys.forEach { key ->
                result.add(MapEntry(key, overrides[key]))
            }

            return result
        }

    override val size: Int = base.size + overrideOnlyKeys.size

    override fun get(key: String): Any? = if (overrides.containsKey(key)) overrides[key] else base[key]

    override fun containsKey(key: String): Boolean = overrides.containsKey(key) || base.containsKey(key)
}

private data class MapEntry(
    override val key: String,
    override val value: Any?,
) : Map.Entry<String, Any?>
