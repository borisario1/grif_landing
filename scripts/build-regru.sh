#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/out"
TARGET_DIR="${ROOT_DIR}/RegRuWWW"

echo "Building static export..."
cd "${ROOT_DIR}"
npm run build

if [ ! -d "${OUT_DIR}" ]; then
  echo "Error: '${OUT_DIR}' folder was not generated."
  exit 1
fi

echo "Refreshing RegRuWWW..."
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
cp -R "${OUT_DIR}/." "${TARGET_DIR}/"

echo "Done. Upload contents of '${TARGET_DIR}' to hosting public folder."
