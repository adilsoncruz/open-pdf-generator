# Contributing Guide

Thank you for considering contributing to Open PDF Generator! 🎉

This document provides guidelines and information for contributors.

## 📋 Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

### Our Standards

**Examples of behavior that contributes to a positive environment:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**

- The use of sexualized language or imagery, and sexual attention or advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without their explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

Project maintainers are obligated to respect the privacy and security of the reporter of any incident.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.1.

---

## 🐛 Reporting Bugs

If you found a bug, please open an issue including:

1. **Descriptive title**
2. **Detailed description** of the problem
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Screenshots** (if applicable)
6. **Environment** (OS, versions, etc.)

## 💡 Suggesting Enhancements

Enhancement issues are welcome! Please include:

1. **Context** - Why is this enhancement useful?
2. **Proposal** - How should it work?
3. **Alternatives** - Other approaches considered?

## 🔀 Pull Requests

### Process

1. **Fork** the repository
2. **Clone** your fork: `git clone <your-fork-url>`
3. **Create a branch**: `git checkout -b feature/my-feature`
4. **Make your changes**
5. **Test** your changes
6. **Commit**: `git commit -m 'feat: add my feature'`
7. **Push**: `git push origin feature/my-feature`
8. **Open a Pull Request**

### Checklist

- [ ] Code follows the project style
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] Build passes without errors
- [ ] Commits follow conventions

### Commit Convention

```
type: short description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, semicolons, etc.
- `refactor`: Code refactoring
- `test`: Add/modify tests
- `chore`: Dependency updates, etc.

**Examples:**
```
feat: add support for custom fonts
fix: resolve image caching issue
docs: update API documentation
```

---

## 🏗️ Project Structure

```
open-pdf-generator/
│
├── core/                       # PDF Generator Engine (Kotlin)
│   ├── src/
│   │   ├── main/kotlin/        # Source code
│   │   └── test/kotlin/        # Tests
│   └── build.gradle.kts
│
├── tools/
│   ├── cli/                    # Command Line Interface (Kotlin)
│   │   ├── src/
│   │   └── build.gradle.kts
│   │
│   └── editor/                 # Desktop Template Editor (Electron + React)
│       ├── src/
│       │   ├── main/           # Electron main process
│       │   └── renderer/       # React + TypeScript + Tailwind
│       └── package.json
│
└── docs/                       # VitePress Documentation
```

### Core Engine (Kotlin)

```kotlin
// Adding a new renderer
class MyRenderer : Renderer<MyElement> {
    override fun render(element: MyElement, context: RendererContext) {
        // Implementation
    }
}
```

### Template Editor (React/TypeScript)

```typescript
// Adding a new component
export default function MyComponent() {
    const { template } = useTemplateStore()
    
    return (
        <div className="p-4">
            {/* JSX */}
        </div>
    )
}
```

### CLI (Kotlin)

```kotlin
// Adding a new command
class MyCommand : CliktCommand() {
    override fun run() {
        // Implementation
    }
}
```

---

## 🧪 Testing

### Core Engine

```bash
cd core
./gradlew test
```

### Template Editor

```bash
cd tools/editor
npm test
```

### CLI

```bash
cd tools/cli
../../gradlew test
```

### Run All Tests

```bash
make test
```

---

## 🔧 Local Development

### Prerequisites

- **JDK 21+** - For core and CLI
- **Node.js 18+** - For editor and docs
- **npm** - Package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Build the core
make build

# Setup the editor
cd tools/editor && npm install

# Run the editor in development mode
npm run dev
```

### Build

```bash
# Full build (core + CLI)
make build

# Build only the core
make core-build

# Build the CLI (creates executable JAR)
make cli-build

# Build the editor (creates desktop app)
make editor-package
```

---

## 📝 Documentation

When adding features, please update:

1. **README.md** - If it changes basic usage
2. **docs/** - VitePress documentation
3. **Examples** - Add usage examples
4. **CHANGELOG.md** - Describe changes

### Run Docs Locally

```bash
make docs-dev
```

---

## 🎨 Code Style

### Kotlin (Core & CLI)

- Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Verify with ktlint before committing
- Maximum 120 characters per line
- JDK 21 for core and CLI

### TypeScript/React (Editor)

- Follow [Airbnb React/JSX Style Guide](https://airbnb.io/javascript/react/)
- Use Prettier for formatting
- Use ESLint for linting
- Functional components with hooks
- Zustand for state management
- Tailwind CSS for styles

### Naming Conventions

**Kotlin:**
```kotlin
// Classes: PascalCase
class PDFGenerator

// Functions/Variables: camelCase
fun generatePDF()
val templateName: String

// Constants: UPPER_SNAKE_CASE
const val MAX_SIZE = 1000
```

**TypeScript:**
```typescript
// Components: PascalCase
function MyComponent() {}

// Functions/Variables: camelCase
const handleClick = () => {}
const userName = "John"

// Constants: UPPER_SNAKE_CASE
const API_URL = "..."
```

---

## 🔍 Code Review

Pull requests will be reviewed considering:

- **Functionality** - Does it do what it promises?
- **Quality** - Is the code clean and readable?
- **Tests** - Does it have adequate coverage?
- **Performance** - Are there bottlenecks?
- **Security** - Are there vulnerabilities?
- **Documentation** - Is it documented?

---

## 📦 Release Process

1. Update `CHANGELOG.md` in each module
2. Bump version:
   - Core: `core/build.gradle.kts`
   - CLI: `tools/cli/build.gradle.kts`
   - Editor: `tools/editor/package.json`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release

---

## 💡 Questions?

- 📖 Read the [documentation](https://adilsoncruz.github.io/open-pdf-generator/)
- 💬 Join the [discussions](https://github.com/adilsoncruz/open-pdf-generator/discussions)
- 🐛 Open an [issue](https://github.com/adilsoncruz/open-pdf-generator/issues)

---

## 🙏 Acknowledgments

Thank you to all contributors who help make this project better!

---

**Happy Coding!** 🚀
