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
remove_tree() {
  local path="$1"
  [ -e "${path}" ] || return 0
  chmod -R u+w "${path}" 2>/dev/null || true
  if [ -x /usr/bin/chflags ]; then
    /usr/bin/chflags -R nouchg,noschg,nohidden "${path}" 2>/dev/null || true
  fi
  if /bin/rm -rf "${path}"; then
    return 0
  fi
  # Fallback: depth-first delete (helps with odd flags / partially locked trees on macOS)
  find "${path}" -depth -mindepth 0 -delete 2>/dev/null || true
  [ ! -e "${path}" ] || /bin/rm -rf "${path}"
}

remove_tree "${TARGET_DIR}"
if [ -e "${TARGET_DIR}" ]; then
  echo "Error: could not remove '${TARGET_DIR}'. Close Finder or terminals using that folder, then run again." >&2
  exit 1
fi
mkdir -p "${TARGET_DIR}"
cp -R "${OUT_DIR}/." "${TARGET_DIR}/"

echo "Done. Upload contents of '${TARGET_DIR}' to hosting public folder."
