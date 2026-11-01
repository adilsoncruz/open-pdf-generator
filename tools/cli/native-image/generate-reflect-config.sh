#!/bin/sh
# Generates reflect-config.json entries for the core model classes.
#
# Gson deserializes templates through reflection and allocates instances with
# sun.misc.Unsafe, which GraalVM native-image only allows for types explicitly
# registered with "unsafeAllocated": true. The tracing agent does not record
# unsafe allocations, so we enumerate com.pdfgenerator.* classes from the JAR.
set -eu

JAR="$1"
OUT_DIR="$2"

mkdir -p "$OUT_DIR"

jar tf "$JAR" \
  | grep -E '^com/pdfgenerator/.*\.class$' \
  | grep -v '\$' \
  | sed -e 's#/#.#g' -e 's#\.class$##' \
  | sort \
  | awk 'BEGIN { print "[" } {
        printf "%s{\"name\":\"%s\",\"allDeclaredFields\":true,\"allDeclaredConstructors\":true,\"allDeclaredMethods\":true,\"unsafeAllocated\":true}\n", (NR > 1 ? "," : ""), $0
      } END { print "]" }' \
  > "$OUT_DIR/reflect-config.json"

echo "reflect-config.json entries: $(grep -c '"name"' "$OUT_DIR/reflect-config.json")"
