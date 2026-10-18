import re

with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "r") as f:
    content = f.read()

# The block starts with `is RichTextElement -> {`
# We need to find it and find the matching `}`
start_idx = content.find("            is RichTextElement -> {")
if start_idx != -1:
    brace_count = 0
    in_block = False
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
            in_block = True
        elif content[i] == '}':
            brace_count -= 1
        
        if in_block and brace_count == 0:
            end_idx = i
            break
            
    if end_idx != -1:
        # Delete the whole block
        # include the trailing newline if any
        if end_idx + 1 < len(content) and content[end_idx + 1] == '\n':
            end_idx += 1
        content = content[:start_idx] + content[end_idx+1:]
        
with open("core/src/main/kotlin/com/pdfgenerator/api/PDFGenerator.kt", "w") as f:
    f.write(content)
