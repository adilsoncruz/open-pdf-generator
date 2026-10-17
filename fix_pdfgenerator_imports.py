with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
    lines = f.readlines()

out = []
seen = set()
for line in lines:
    if line.startswith("import com.pdfgenerator.model."):
        if line in seen:
            continue
        seen.add(line)
    out.append(line)

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
    f.writelines(out)

# also fix RenderEngine
with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "r") as f:
    lines = f.readlines()

out = []
seen = set()
for line in lines:
    if line.startswith("import com.pdfgenerator.model.") or line.startswith("import com.pdfgenerator.adapter.openpdf."):
        if line in seen:
            continue
        seen.add(line)
    out.append(line)

with open("core/src/main/kotlin/com/pdfgenerator/engine/RenderEngine.kt", "w") as f:
    f.writelines(out)
