#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

if ! command -v native-image >/dev/null 2>&1; then
  echo "❌ Error: 'native-image' not found in PATH." >&2
  echo "Please ensure GraalVM (JDK 21) with native-image is installed and activated." >&2
  exit 1
fi

echo "🔨 [1/4] Building Core and CLI Fat JAR..."
"${ROOT_DIR}/core/gradlew" -p "${ROOT_DIR}/core" jar -q
"${ROOT_DIR}/tools/cli/gradlew" -p "${ROOT_DIR}/tools/cli" shadowJar -q

JAR_PATH=$(ls "${ROOT_DIR}/tools/cli/build/libs"/pdf-generator-cli-*.jar 2>/dev/null | head -n 1)
if [ -z "${JAR_PATH}" ] || [ ! -f "${JAR_PATH}" ]; then
  echo "❌ Error: Could not find built CLI jar in tools/cli/build/libs/" >&2
  exit 1
fi

META_DIR="${ROOT_DIR}/tools/cli/build/native-meta"
mkdir -p "${META_DIR}"

echo "🔍 [2/4] Generating reflection config and running training traces..."
sh "${SCRIPT_DIR}/generate-reflect-config.sh" "${JAR_PATH}" "${META_DIR}"

TRAIN_DIR="${SCRIPT_DIR}/train"
TMP_TRAIN="$(mktemp -d)"
trap 'rm -rf "${TMP_TRAIN}"' EXIT

java -agentlib:native-image-agent=config-merge-dir="${META_DIR}" -jar "${JAR_PATH}" \
  generate "${TRAIN_DIR}/invoice.json" -d "${TRAIN_DIR}/data_invoice.json" -o "${TMP_TRAIN}/out1.pdf" >/dev/null
java -agentlib:native-image-agent=config-merge-dir="${META_DIR}" -jar "${JAR_PATH}" \
  generate "${TRAIN_DIR}/listing.json" -d "${TRAIN_DIR}/data_listing.json" -o "${TMP_TRAIN}/out2.pdf" >/dev/null
java -agentlib:native-image-agent=config-merge-dir="${META_DIR}" -jar "${JAR_PATH}" \
  generate "${TRAIN_DIR}/complex.json" -d "${TRAIN_DIR}/data_complex.json" -o "${TMP_TRAIN}/out3.pdf" >/dev/null
java -agentlib:native-image-agent=config-merge-dir="${META_DIR}" -jar "${JAR_PATH}" \
  validate "${TRAIN_DIR}/invoice.json" >/dev/null
java -agentlib:native-image-agent=config-merge-dir="${META_DIR}" -jar "${JAR_PATH}" version >/dev/null

BIN_NAME="pdf-generator"
if [ "$(uname -s | tr '[:upper:]' '[:lower:]')" = "windows" ] || [[ "${OSTYPE:-}" == "msys"* ]] || [[ "${OSTYPE:-}" == "cygwin"* ]]; then
  BIN_NAME="pdf-generator.exe"
fi

CLI_BUILD_DIR="${ROOT_DIR}/tools/cli/build"
OUTPUT_BIN="${CLI_BUILD_DIR}/${BIN_NAME}"

echo "⚡ [3/4] Compiling native binary with GraalVM native-image..."
native-image \
  --no-fallback \
  -march=compatibility \
  -Djava.awt.headless=true \
  -jar "${JAR_PATH}" \
  -o "${OUTPUT_BIN}" \
  -H:ConfigurationFileDirectories="${META_DIR}" \
  -H:+ReportExceptionStackTraces \
  --initialize-at-run-time=org.slf4j.LoggerFactory,org.slf4j.helpers.Reporter,ch.qos.logback \
  --initialize-at-build-time=java.awt.Color,java.awt.Toolkit,java.awt.image,java.awt.color,java.awt.Insets \
  -H:IncludeResources='logback.xml'

chmod +x "${OUTPUT_BIN}"

echo "📦 [4/4] Copying binary to tools/editor/resources/bin/..."
EDITOR_BIN_DIR="${ROOT_DIR}/tools/editor/resources/bin"
mkdir -p "${EDITOR_BIN_DIR}"
cp "${OUTPUT_BIN}" "${EDITOR_BIN_DIR}/${BIN_NAME}"
chmod +x "${EDITOR_BIN_DIR}/${BIN_NAME}"

echo "✅ Native binary successfully built and installed to:"
echo "   - ${OUTPUT_BIN}"
echo "   - ${EDITOR_BIN_DIR}/${BIN_NAME}"
"${EDITOR_BIN_DIR}/${BIN_NAME}" version || true
