# ============================================================================
# Open PDF Generator - Makefile
# ============================================================================
# A complete toolkit for generating PDFs from JSON templates
#
# Usage: make <target>
# Run 'make help' for available targets
# ============================================================================

.DEFAULT_GOAL := help

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
BOLD := \033[1m
NC := \033[0m # No Color

# Project info
PROJECT_NAME := Open PDF Generator
VERSION := 1.0.0

# Directories
ROOT_DIR := $(shell pwd)
CORE_DIR := $(ROOT_DIR)/core
CLI_DIR := $(ROOT_DIR)/tools/cli
EDITOR_DIR := $(ROOT_DIR)/tools/editor
DOCS_DIR := $(ROOT_DIR)/docs

# Executables
GRADLE := ./gradlew
NPM := npm

# ============================================================================
# PHONY TARGETS
# ============================================================================
.PHONY: help all build clean test install dev \
        hooks-install \
        core core-build core-test core-jar core-clean \
        cli cli-build cli-clean cli-install \
        editor editor-install editor-dev editor-build editor-package editor-package-mac editor-package-win editor-package-linux editor-package-all editor-clean \
        docs docs-install docs-dev docs-build docs-preview docs-clean \
        check version info

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo ""
	@echo "$(BOLD)$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BOLD)$(BLUE)║           $(PROJECT_NAME) v$(VERSION)                    ║$(NC)"
	@echo "$(BOLD)$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BOLD)Usage:$(NC) make $(CYAN)<target>$(NC)"
	@echo ""
	@echo "$(BOLD)$(GREEN)── Global ──────────────────────────────────────────────────────$(NC)"
	@grep -E '^(all|build|clean|test|install|dev|check|version|info):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)$(GREEN)── Core (Kotlin Library) ───────────────────────────────────────$(NC)"
	@grep -E '^core[a-z-]*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)$(GREEN)── CLI (Command Line Interface) ────────────────────────────────$(NC)"
	@grep -E '^cli[a-z-]*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)$(GREEN)── Editor (Desktop App) ────────────────────────────────────────$(NC)"
	@grep -E '^editor[a-z-]*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)$(GREEN)── Docs (VitePress) ────────────────────────────────────────────$(NC)"
	@grep -E '^docs[a-z-]*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# GLOBAL TARGETS
# ============================================================================

all: core-build cli-build editor-build docs-build ## Build everything (core, cli, editor, docs)
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ All components built successfully!$(NC)"

build: core-build cli-build ## Build core library and CLI
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ Core and CLI built successfully!$(NC)"

clean: core-clean cli-clean editor-clean docs-clean ## Clean all build artifacts
	@rm -rf $(ROOT_DIR)/build
	@echo "$(GREEN)✓ All build artifacts cleaned$(NC)"

test: core-test ## Run all tests
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ All tests passed!$(NC)"

install: hooks-install editor-install docs-install ## Install all npm dependencies
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ All dependencies installed!$(NC)"

hooks-install: ## Install git hooks (husky + commitlint)
	@echo ""
	@echo "$(BOLD)$(BLUE)Installing Git Hooks...$(NC)"
	@$(NPM) install
	@echo "$(GREEN)✓ Git hooks installed$(NC)"

dev: ## Start editor in development mode (alias for editor-dev)
	@$(MAKE) editor-dev

check: ## Check project health (versions, dependencies)
	@echo ""
	@echo "$(BOLD)$(BLUE)Checking project health...$(NC)"
	@echo ""
	@echo "$(BOLD)Java:$(NC)"
	@java -version 2>&1 | head -1
	@echo ""
	@echo "$(BOLD)Gradle:$(NC)"
	@cd $(CORE_DIR) && $(GRADLE) --version | grep -E "^Gradle|^Kotlin"
	@echo ""
	@echo "$(BOLD)Node.js:$(NC)"
	@node --version
	@echo ""
	@echo "$(BOLD)npm:$(NC)"
	@npm --version
	@echo ""
	@echo "$(GREEN)✓ All tools available$(NC)"

version: ## Show version information
	@echo "$(PROJECT_NAME) v$(VERSION)"

info: ## Show project structure and info
	@echo ""
	@echo "$(BOLD)$(BLUE)Project Structure:$(NC)"
	@echo ""
	@echo "  $(CYAN)core/$(NC)           PDF Generator Engine (Kotlin/Java)"
	@echo "  $(CYAN)tools/cli/$(NC)      Command Line Interface (Kotlin)"
	@echo "  $(CYAN)tools/editor/$(NC)   Desktop Template Editor (Electron + React)"
	@echo "  $(CYAN)docs/$(NC)           Documentation Site (VitePress)"
	@echo ""
	@echo "$(BOLD)$(BLUE)Quick Start:$(NC)"
	@echo ""
	@echo "  make install      Install all dependencies"
	@echo "  make build        Build core and CLI"
	@echo "  make editor-dev   Start editor in dev mode"
	@echo "  make docs-dev     Start docs in dev mode"
	@echo ""

# ============================================================================
# CORE (Kotlin Library)
# ============================================================================

core: core-build ## Alias for core-build

core-build: ## Build the core library
	@echo ""
	@echo "$(BOLD)$(BLUE)Building Core Library...$(NC)"
	@cd $(CORE_DIR) && $(GRADLE) build -x test -x jacocoTestCoverageVerification
	@echo "$(GREEN)✓ Core library built$(NC)"

core-test: ## Run core tests with coverage
	@echo ""
	@echo "$(BOLD)$(BLUE)Running Core Tests...$(NC)"
	@cd $(CORE_DIR) && $(GRADLE) test jacocoTestReport
	@echo "$(GREEN)✓ Core tests completed$(NC)"
	@echo "  Coverage report: $(CORE_DIR)/build/reports/jacoco/test/html/index.html"

core-jar: ## Build standalone JAR (fat JAR)
	@echo ""
	@echo "$(BOLD)$(BLUE)Building Standalone JAR...$(NC)"
	@cd $(CORE_DIR) && $(GRADLE) fatJar
	@echo "$(GREEN)✓ Standalone JAR built$(NC)"
	@echo "  Output: $(CORE_DIR)/build/libs/open-pdf-generator-$(VERSION)-standalone.jar"

core-clean: ## Clean core build artifacts
	@echo "$(YELLOW)Cleaning core...$(NC)"
	@cd $(CORE_DIR) && $(GRADLE) clean --quiet
	@echo "$(GREEN)✓ Core cleaned$(NC)"

# ============================================================================
# CLI (Command Line Interface)
# ============================================================================

cli: cli-build ## Alias for cli-build

cli-build: core-build ## Build CLI (depends on core)
	@echo ""
	@echo "$(BOLD)$(BLUE)Building CLI...$(NC)"
	@cd $(CLI_DIR) && $(GRADLE) shadowJar
	@echo "$(GREEN)✓ CLI built$(NC)"
	@echo "  Output: $(CLI_DIR)/build/libs/pdf-generator-cli-*.jar"

cli-clean: ## Clean CLI build artifacts
	@echo "$(YELLOW)Cleaning CLI...$(NC)"
	@cd $(CLI_DIR) && $(GRADLE) clean --quiet
	@echo "$(GREEN)✓ CLI cleaned$(NC)"

cli-install: cli-build ## Install CLI locally for Editor development
	@echo ""
	@echo "$(BOLD)$(BLUE)Installing CLI for development...$(NC)"
	@mkdir -p ~/.pdf-generator
	@cp $$(ls -t $(CLI_DIR)/build/libs/pdf-generator-cli-*.jar | head -1) ~/.pdf-generator/pdf-generator.jar
	@echo "$(VERSION)" > ~/.pdf-generator/version.txt
	@echo "$(GREEN)✓ CLI installed to ~/.pdf-generator/pdf-generator.jar$(NC)"

# ============================================================================
# EDITOR (Desktop App - Electron + React)
# ============================================================================

editor: editor-build ## Alias for editor-build

editor-install: ## Install editor dependencies
	@echo ""
	@echo "$(BOLD)$(BLUE)Installing Editor Dependencies...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) install
	@echo "$(GREEN)✓ Editor dependencies installed$(NC)"

editor-dev: editor-install ## Start editor in development mode
	@echo ""
	@echo "$(BOLD)$(BLUE)Starting Editor (Dev Mode)...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@echo ""
	@cd $(EDITOR_DIR) && $(NPM) run dev

editor-build: editor-install ## Build editor for production
	@echo ""
	@echo "$(BOLD)$(BLUE)Building Editor...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run build
	@echo "$(GREEN)✓ Editor built$(NC)"

editor-package: editor-build ## Package editor as desktop app (current OS)
	@echo ""
	@echo "$(BOLD)$(BLUE)Packaging Editor (Current OS)...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run package
	@echo "$(GREEN)✓ Editor packaged$(NC)"
	@echo "  Output: $(EDITOR_DIR)/release/"

editor-package-mac: editor-build ## Package editor for macOS (DMG + ZIP)
	@echo ""
	@echo "$(BOLD)$(BLUE)Packaging Editor (macOS)...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run package:mac
	@echo "$(GREEN)✓ macOS app packaged$(NC)"
	@echo "  Output: $(EDITOR_DIR)/release/"

editor-package-win: editor-build ## Package editor for Windows (NSIS + ZIP)
	@echo ""
	@echo "$(BOLD)$(BLUE)Packaging Editor (Windows)...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run package:win
	@echo "$(GREEN)✓ Windows app packaged$(NC)"
	@echo "  Output: $(EDITOR_DIR)/release/"

editor-package-linux: editor-build ## Package editor for Linux (AppImage + DEB)
	@echo ""
	@echo "$(BOLD)$(BLUE)Packaging Editor (Linux)...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run package:linux
	@echo "$(GREEN)✓ Linux app packaged$(NC)"
	@echo "  Output: $(EDITOR_DIR)/release/"

editor-package-all: editor-build ## Package editor for all platforms (macOS, Windows, Linux)
	@echo ""
	@echo "$(BOLD)$(BLUE)Packaging Editor (All Platforms)...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run package:all
	@echo "$(GREEN)✓ All platforms packaged$(NC)"
	@echo "  Output: $(EDITOR_DIR)/release/"

editor-clean: ## Clean editor build artifacts
	@echo "$(YELLOW)Cleaning Editor...$(NC)"
	@rm -rf $(EDITOR_DIR)/dist
	@rm -rf $(EDITOR_DIR)/release
	@echo "$(GREEN)✓ Editor cleaned$(NC)"

editor-lint: ## Run editor linting
	@echo ""
	@echo "$(BOLD)$(BLUE)Linting Editor...$(NC)"
	@cd $(EDITOR_DIR) && $(NPM) run lint
	@echo "$(GREEN)✓ Editor linting completed$(NC)"

# ============================================================================
# DOCS (VitePress Documentation)
# ============================================================================

docs: docs-build ## Alias for docs-build

docs-install: ## Install docs dependencies
	@echo ""
	@echo "$(BOLD)$(BLUE)Installing Docs Dependencies...$(NC)"
	@cd $(DOCS_DIR) && $(NPM) install
	@echo "$(GREEN)✓ Docs dependencies installed$(NC)"

docs-dev: docs-install ## Start docs in development mode
	@echo ""
	@echo "$(BOLD)$(BLUE)Starting Docs (Dev Mode)...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@echo ""
	@cd $(DOCS_DIR) && $(NPM) run dev

docs-build: docs-install ## Build docs for production
	@echo ""
	@echo "$(BOLD)$(BLUE)Building Docs...$(NC)"
	@cd $(DOCS_DIR) && $(NPM) run build
	@echo "$(GREEN)✓ Docs built$(NC)"
	@echo "  Output: $(DOCS_DIR)/.vitepress/dist/"

docs-preview: docs-build ## Preview production docs build
	@echo ""
	@echo "$(BOLD)$(BLUE)Previewing Docs...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@echo ""
	@cd $(DOCS_DIR) && $(NPM) run preview

docs-clean: ## Clean docs build artifacts
	@echo "$(YELLOW)Cleaning Docs...$(NC)"
	@rm -rf $(DOCS_DIR)/.vitepress/dist
	@rm -rf $(DOCS_DIR)/.vitepress/cache
	@echo "$(GREEN)✓ Docs cleaned$(NC)"

