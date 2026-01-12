# Element Positioning

By default, all elements use absolute positioning with fixed X and Y coordinates. Starting with version 1.1, you can use **relative positioning** to create dynamic layouts.

## Position Mode

| Mode | Behavior |
|------|----------|
| `ABSOLUTE` | Fixed position on canvas (default) |
| `RELATIVE` | Position based on previous content |

---

## Absolute Positioning

The default mode. The `x` and `y` coordinates define the exact element position on the page.

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "This text is at position (50, 100)"
}
```

**Use when:**
- Layout is fixed and predictable
- Elements don't depend on dynamic content
- Headers, footers, and static labels

---

## Relative Positioning

The element is positioned relative to the previous element. The canvas `y` is ignored and `relativeOffsetY` is used to define the spacing.

```json
{
  "type": "text",
  "x": 50,
  "positionMode": "RELATIVE",
  "relativeOffsetY": 20,
  "value": "This text appears 20pt below the previous element"
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `positionMode` | string | `"ABSOLUTE"` or `"RELATIVE"` |
| `relativeOffsetY` | number | Vertical spacing (default: 10) |

**Use when:**
- Layout depends on dynamic content
- After loops with variable number of items
- After multiline texts with `overflow: auto`

---

## Example: Invoice with Loop

A common case is having loop items followed by a total:

```json
{
  "elements": [
    {
      "type": "text",
      "id": "title",
      "x": 50,
      "y": 50,
      "value": "INVOICE ITEMS",
      "style": { "fontWeight": "bold" }
    },
    {
      "type": "loop",
      "id": "items",
      "dataBinding": "items",
      "x": 50,
      "y": 80,
      "width": 500,
      "height": 30,
      "itemSpacing": 5,
      "elements": [
        {
          "type": "text",
          "x": 0,
          "y": 5,
          "dataBinding": "name"
        },
        {
          "type": "text",
          "x": 400,
          "y": 5,
          "dataBinding": "price | currency:'BRL'"
        }
      ]
    },
    {
      "type": "line",
      "id": "separator",
      "x": 50,
      "y": 0,
      "x2": 550,
      "y2": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 10
    },
    {
      "type": "text",
      "id": "total",
      "x": 400,
      "y": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 15,
      "dataBinding": "total | currency:'BRL'",
      "style": { 
        "fontWeight": "bold",
        "fontSize": 14 
      }
    }
  ]
}
```

### Behavior

1. **Title** - Absolute position at (50, 50)
2. **Loop** - Starts at (50, 80), each item has 30pt height + 5pt spacing
3. **Separator line** - Positioned 10pt below the last loop item
4. **Total** - Positioned 15pt below the line

Regardless of how many items the loop has, the separator and total are always positioned correctly!

---

## Combining with Overflow Auto

For multiline texts that can have variable sizes:

```json
[
  {
    "type": "text",
    "id": "description",
    "x": 50,
    "y": 100,
    "width": 500,
    "height": 50,
    "dataBinding": "description",
    "style": {
      "multiline": true,
      "overflow": "auto"
    }
  },
  {
    "type": "text",
    "id": "signature",
    "x": 50,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 30,
    "value": "_____________________\nSignature"
  }
]
```

The `overflow: auto` makes the text height adjust to the content, and the signature element is positioned after all the text, regardless of how many lines it has.

---

## Element Order

::: warning Important
Relative positioning depends on the **order of elements** in the array. The `currentY` calculation is done sequentially.
:::

Elements with `positionMode: RELATIVE` are positioned relative to the accumulated `currentY`, which is updated after each rendered element.

---

## Limitations

- ❌ Does not work in Header and Footer (use fixed layout)
- ❌ Does not affect X position (only Y is relative)
- ❌ Elements inside loops use local positioning to the loop

---

## Next Steps

- [Loop Element](/guide/elements/loop) - Loops with automatic pagination
- [Text Element](/guide/elements/text) - Multiline text with overflow
- [Pagination](/guide/advanced/pagination) - Understand how pagination works
