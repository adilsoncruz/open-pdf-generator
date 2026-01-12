# 🤝 Contributing Guide

Thank you for considering contributing to the Open PDF Generator Library! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Improvements](#suggesting-improvements)
- [Contributing Code](#contributing-code)
- [Code Style](#code-style)
- [Review Process](#review-process)
- [License](#license)

## 📜 Code of Conduct

This project adheres to a Code of Conduct. By participating, you agree to maintain a respectful and inclusive environment.

### Our Standards

**Encouraged Behaviors** ✅:
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other members

**Unacceptable Behaviors** ❌:
- Sexualized language or imagery
- Insulting or derogatory comments
- Public or private harassment
- Publishing private information without permission
- Any unprofessional conduct

## 🎯 How Can I Contribute?

### Reporting Bugs

Bugs are tracked as [GitHub Issues](https://github.com/adilsoncruz/open-pdf-generator/issues).

**Before reporting**, check if the bug has already been reported.

**When creating a bug report**, include:

- ✅ **Clear and descriptive title**
- ✅ **Steps to reproduce** the problem
- ✅ **Expected behavior** vs **actual behavior**
- ✅ **Library version**
- ✅ **Environment**: OS, JDK, Kotlin/Java
- ✅ **Template JSON** (if applicable)
- ✅ **Input data** (if applicable)
- ✅ **Complete logs/stacktrace**

**Bug Report Template:**

```markdown
## Description
[Clear description of the bug]

## Steps to Reproduce
1. Create a template with...
2. Execute with the data...
3. See the error...

## Expected Behavior
[What should happen]

## Actual Behavior
[What is happening]

## Environment
- PDF Generator: v1.0.0
- OS: macOS 13.0
- JDK: 21
- Kotlin: 1.9.21

## Template JSON
```json
{
  ...
}
```

## Data
```json
{
  ...
}
```

## Logs
```
[Stacktrace or logs]
```
```

### Suggesting Improvements

Improvements are also tracked as [GitHub Issues](https://github.com/adilsoncruz/open-pdf-generator/issues).

**Feature Request Template:**

```markdown
## Problem/Need
[Describe the problem or need]

## Proposed Solution
[How you imagine this should work]

## Alternatives Considered
[Other approaches you've thought of]

## Additional Context
[Screenshots, examples, references]

## Impact
[Who would benefit from this feature]
```

## 💻 Contributing Code

### Environment Setup

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/open-pdf-generator.git
   cd open-pdf-generator
   ```
3. **Configure upstream**:
   ```bash
   git remote add upstream https://github.com/adilsoncruz/open-pdf-generator.git
   ```
4. **Install dependencies**:
   ```bash
   ./gradlew build
   ```

### Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b bugfix/fix-bug
   ```

2. **Make your changes**
   - Write clean and well-documented code
   - Add tests for new features
   - Keep tests passing

3. **Run tests**:
   ```bash
   ./gradlew test
   ```

4. **Run linter**:
   ```bash
   ./gradlew ktlintCheck
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add custom font support"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

7. **Open a Pull Request** on GitHub

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
type(scope): short description

Optional long description

Optional footer
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code changes
- `refactor`: Code refactoring
- `test`: Add or fix tests
- `chore`: Changes to build, CI, etc.

**Examples**:
```bash
feat(template): add support for custom TTF fonts
fix(renderer): fix text rendering with negative Y
docs(readme): update usage examples
test(table): add pagination tests
```

## 🎨 Code Style

### Kotlin

We follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html).

**Main rules**:
- Indentation: 4 spaces
- Maximum line length: 120 characters
- Use `val` instead of `var` whenever possible
- Use trailing commas
- Use expressions instead of statements when possible

**Example**:

```kotlin
data class TextElement(
    override val type: String = "text",
    override val id: String,
    override val x: Float,
    override val y: Float,
    val value: String? = null,
    val style: TextStyle? = null,
) : Element {
    override fun validate(pageSettings: PageSettings): List<ValidationError> {
        return when {
            value == null -> listOf(ValidationError(id, "Value is required"))
            else -> emptyList()
        }
    }
}
```

### Tests

- Use descriptive names in backticks:
  ```kotlin
  @Test
  fun `should render text successfully`() {
      // ...
  }
  ```
- One assert per test (when it makes sense)
- Use fixtures and factories for test data

### Documentation

- **Public classes**: Add KDoc
- **Public functions**: Add KDoc
- **Complex parameters**: Document the behavior
- **Examples**: Add when relevant

```kotlin
/**
 * Renders a text element in the PDF.
 * 
 * @param element Text element to be rendered
 * @param context Rendering context with data and settings
 * @throws PDFGenerationException if the text cannot be rendered
 * 
 * @example
 * ```kotlin
 * val element = TextElement(...)
 * val context = RendererContext(...)
 * textRenderer.render(element, context)
 * ```
 */
fun render(element: TextElement, context: RendererContext)
```

## 🔍 Review Process

After opening a Pull Request:

1. **CI/CD will run**:
   - ✅ Automated tests
   - ✅ Static analysis (ktlint)
   - ✅ Build for JDK 21

2. **Reviewers will check**:
   - 📝 Code quality
   - 🧪 Test coverage
   - 📚 Documentation
   - 🎯 Alignment with project goals

3. **Feedback**:
   - Be receptive to suggestions
   - Make requested changes
   - Respond to comments

4. **Merge**:
   - Will be done by a maintainer
   - After approval and green CI

### PR Checklist

- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No linter warnings
- [ ] Commits follow convention
- [ ] PR has clear description

## 📜 License

By contributing, you agree that your contributions will be licensed under the **GNU Lesser General Public License v3.0 (LGPLv3)**.

### What this means for you:

- ✅ Your contributions will be open source
- ✅ Others can use and modify your code
- ✅ You will be credited as a contributor
- ⚠️ The code must remain under LGPLv3

## 🙏 Acknowledgments

Thank you for taking the time to improve this project! Every contribution, big or small, is very valuable.

---

**Questions?** Open an [issue](https://github.com/adilsoncruz/open-pdf-generator/issues) or get in touch!

**Want to discuss first?** Comment on an existing issue to discuss your idea.
