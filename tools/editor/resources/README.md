# Resources - PDF Template Editor

This directory contains the application's static resources (icons, splash screen, etc).

## 📦 Files

- **`icon.icns`** - macOS icon
- **`icon.ico`** - Windows icon
- **`icon.png`** - PNG format icon
- **`icon.svg`** - SVG format icon
- **`splash.html`** - Splash screen during loading

## 🔧 PDF Generator CLI

The PDF Generator CLI **is no longer bundled with the app**. It is installed separately on the user's system.

### Installation Location

The CLI is installed at:
- **macOS/Linux**: `~/.pdf-generator/pdf-generator.jar`
- **Windows**: `%USERPROFILE%\.pdf-generator\pdf-generator.jar`

### CLI Installation

The app automatically checks if the CLI is installed and offers the following options:

1. **Automatic installation**: Downloads the JAR from the latest release
2. **Manual selection**: Allows selecting a local JAR file

### CLI Update

You can update the CLI independently from the app:

```bash
# Build the library
cd library
./gradlew fatJar

# Copy to installation directory
cp build/libs/open-pdf-generator-1.0.0-standalone.jar ~/.pdf-generator/pdf-generator.jar

# Update version file
echo "1.0.0" > ~/.pdf-generator/version.txt
```

## ✅ Advantages of this Architecture

1. **Lighter app**: The app doesn't include the ~5MB JAR
2. **Independent updates**: The CLI can be updated without reinstalling the app
3. **Sharing**: Multiple app versions can use the same CLI
4. **Flexibility**: Advanced users can use custom CLI versions

## 📋 Requirements

- **Java 11+**: Required to run the CLI
  - Recommended: [Adoptium](https://adoptium.net/)

## 🔧 Troubleshooting

**Error: "CLI not installed"**

The app will show a dialog to install the CLI. You can:
1. Click "Install Automatically"
2. Select a JAR file manually

**Error: "Java not installed"**

Install Java 11 or higher:
- [Adoptium (recommended)](https://adoptium.net/)
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

**Manual CLI installation:**

```bash
# Create directory
mkdir -p ~/.pdf-generator

# Copy JAR (example)
cp /path/to/open-pdf-generator-1.0.0-standalone.jar ~/.pdf-generator/pdf-generator.jar

# Create version file
echo "1.0.0" > ~/.pdf-generator/version.txt
```
