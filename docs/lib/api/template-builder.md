# TemplateBuilder

Fluent API for creating templates programmatically in Kotlin/Java.

## Import

```kotlin
import com.pdfgenerator.builder.TemplateBuilder
import com.pdfgenerator.builder.template
```

```java
import com.pdfgenerator.builder.TemplateBuilder;
```

---

## Basic Usage

### Kotlin DSL

```kotlin
val template = template {
    pageSettings {
        size = "A4"
        orientation = "portrait"
        margins(top = 30f, right = 30f, bottom = 30f, left = 30f)
    }
    
    text {
        id = "title"
        x = 50f
        y = 50f
        value = "My Document"
        fontSize = 24f
        fontWeight = "bold"
        color = "#2563eb"
    }
}
```

### Java Builder

```java
Template template = new TemplateBuilder()
    .pageSettings(ps -> ps
        .size("A4")
        .orientation("portrait")
        .margins(30f, 30f, 30f, 30f)
    )
    .text(t -> t
        .id("title")
        .x(50f)
        .y(50f)
        .value("My Document")
        .fontSize(24f)
        .fontWeight("bold")
        .color("#2563eb")
    )
    .build();
```

---

## Page Settings

### Kotlin

```kotlin
template {
    pageSettings {
        size = "A4"           // or "Letter", "Legal"
        orientation = "portrait"  // or "landscape"
        margins(30f, 30f, 30f, 30f)  // top, right, bottom, left
    }
}
```

### Java

```java
new TemplateBuilder()
    .pageSettings(ps -> ps
        .size("A4")
        .orientation("portrait")
        .margins(30f, 30f, 30f, 30f)
    )
```

---

## Elements

### Text

```kotlin
text {
    id = "my-text"
    x = 50f
    y = 100f
    value = "Static text"
    // or
    dataBinding = "customer.name"
    
    // Styles
    fontSize = 12f
    fontFamily = "Helvetica"
    fontWeight = "bold"  // "normal", "bold"
    fontStyle = "normal" // "normal", "italic"
    color = "#000000"
    alignment = "left"   // "left", "center", "right", "justify"
}
```

### Image

```kotlin
image {
    id = "logo"
    x = 50f
    y = 50f
    width = 150f
    height = 80f
    source = "https://example.com/logo.png"
    // or
    dataBinding = "company.logo"
    
    fit = "contain"     // "contain", "cover", "fill", "scale-down"
    alignment = "center"
}
```

### Table

```kotlin
table {
    id = "items"
    x = 30f
    y = 200f
    width = 535f
    dataBinding = "order.items"
    
    column("Code", "\$item.code", width = 80f, alignment = "center")
    column("Description", "\$item.description", width = 250f)
    column("Value", "\$item.value", width = 100f, alignment = "right")
    
    style {
        headerBackground = "#2563eb"
        headerColor = "#ffffff"
        alternateRowBackground = "#f3f4f6"
    }
}
```

### Rectangle

```kotlin
rectangle {
    id = "background"
    x = 0f
    y = 0f
    width = 595f  // or "100%"
    height = 100f
    
    fillColor = "#2563eb"
    borderColor = "#1e40af"
    borderWidth = 2f
    cornerRadius = 8f
}
```

### Line

```kotlin
line {
    id = "divider"
    x = 50f
    y = 300f
    x2 = 545f
    y2 = 300f
    
    color = "#d1d5db"
    width = 1f
    dashPattern = listOf(5f, 3f)  // optional, for dashed line
}
```

### Barcode

```kotlin
barcode {
    id = "qrcode"
    x = 400f
    y = 650f
    width = 100f
    height = 100f
    barcodeType = "qrcode"  // or "barcode"
    dataBinding = "payment.pixCode"
    errorCorrection = "M"   // L, M, Q, H
}
```

---

## Fixed Header

```kotlin
template {
    fixedHeader(height = 80f) {
        rectangle {
            id = "header-bg"
            x = 0f
            y = 0f
            width = "100%"
            height = 80f
            fillColor = "#1e40af"
        }
        
        text {
            id = "company"
            x = 30f
            y = 30f
            value = "MY COMPANY"
            fontSize = 16f
            fontWeight = "bold"
            color = "#ffffff"
        }
    }
}
```

---

## Fixed Footer

```kotlin
template {
    fixedFooter(height = 50f) {
        line {
            id = "footer-line"
            x = 30f
            y = 0f
            x2 = 565f
            y2 = 0f
            color = "#d1d5db"
        }
        
        text {
            id = "page"
            x = 500f
            y = 20f
            value = "Page {{pageNumber}} of {{totalPages}}"
            fontSize = 9f
            color = "#6b7280"
        }
    }
}
```

---

## Complete Example

### Invoice

```kotlin
val invoice = template {
    pageSettings {
        size = "A4"
        orientation = "portrait"
        margins(30f, 30f, 30f, 30f)
    }
    
    fixedHeader(height = 100f) {
        rectangle {
            id = "header-bg"
            x = 0f
            y = 0f
            width = "100%"
            height = 100f
            fillColor = "#1e3a8a"
        }
        
        image {
            id = "logo"
            x = 20f
            y = 20f
            width = 100f
            height = 60f
            dataBinding = "company.logo"
            fit = "contain"
        }
        
        text {
            id = "company-name"
            x = 140f
            y = 30f
            dataBinding = "company.name"
            fontSize = 18f
            fontWeight = "bold"
            color = "#ffffff"
        }
        
        text {
            id = "company-ein"
            x = 140f
            y = 55f
            dataBinding = "company.ein"
            fontSize = 10f
            color = "#93c5fd"
        }
    }
    
    fixedFooter(height = 40f) {
        text {
            id = "page"
            x = 480f
            y = 15f
            value = "{{pageNumber}}/{{totalPages}}"
            fontSize = 9f
            color = "#6b7280"
        }
    }
    
    // Body
    text {
        id = "title"
        x = 30f
        y = 20f
        value = "INVOICE"
        fontSize = 14f
        fontWeight = "bold"
    }
    
    text {
        id = "number"
        x = 450f
        y = 20f
        dataBinding = "invoice.number | padLeft:9:'0' | prefix:'No. '"
        fontSize = 12f
    }
    
    table {
        id = "items"
        x = 30f
        y = 80f
        width = 535f
        dataBinding = "invoice.items"
        
        column("Code", "\$item.code", 60f, "center")
        column("Description", "\$item.description", 250f, "left")
        column("Qty", "\$item.quantity", 50f, "center")
        column("Unit", "\$item.unitPrice | currency:'USD'", 85f, "right")
        column("Total", "\$item.total | currency:'USD'", 90f, "right")
        
        style {
            headerBackground = "#f3f4f6"
            headerFontWeight = "bold"
            alternateRowBackground = "#fafafa"
            borderWidth = 0.5f
        }
    }
}

// Use
val generator = PDFGenerator()
generator.generate(invoice, data, File("invoice.pdf"))
```

---

## Conversion to JSON

The TemplateBuilder generates `Template` objects that can be converted to JSON:

```kotlin
val template = template {
    // ...
}

// Save as JSON
val json = template.toJson()
File("template.json").writeText(json)
```

---

## Builder Advantages

| Aspect | JSON | Builder |
|--------|------|---------|
| **Type safe** | ❌ No | ✅ Yes |
| **Autocomplete** | ❌ No | ✅ Yes |
| **Compile-time validation** | ❌ No | ✅ Yes |
| **Reusability** | ⚠️ Copy/paste | ✅ Functions |
| **Dynamic** | ❌ No | ✅ Yes |
| **Versionable** | ✅ Yes | ✅ Yes |
| **Visual editor** | ✅ Yes | ❌ No |

---

## Next Steps

- [Template](/lib/api/template) - Load JSON templates
- [Elements](/lib/api/elements) - All elements
- [Examples](/lib/examples/) - Use cases

