#!/usr/bin/env bash
# Anniversary photo processor
# Resizes and converts photos to match each slot's aspect ratio.
#
# Usage:
#   ./scripts/process-photos.sh <folder-of-photos>
#
# Name your input photos to match slot IDs:
#   ch1-main.jpg, hero-main.heic, closing-hero.png, etc.
#
# Supported input formats: jpg, jpeg, png, webp, heic, HEIC, JPG, JPEG, PNG
# Output: JPEG (default) or WebP (if cwebp is installed: brew install webp)
#
# Requirements: sips (built-in macOS)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INPUT_DIR="${1:-}"
OUTPUT_DIR="$REPO_DIR/assets/images"

# ── Slot definitions: id|aspect-width|aspect-height|output-width ──
SLOTS=(
  "hero-main|9|16|900"
  "ceremony-bg|16|9|1600"
  "ch1-main|4|3|1200"
  "ch2-main|4|3|1200"
  "ch3-main|16|9|1600"
  "ch4-main|4|3|1200"
  "ch5-main|4|3|1200"
  "ch6-main|3|4|900"
  "ch7-main|16|9|1600"
  "ch8-main|4|3|1200"
  "ch9-main|4|3|1200"
  "ch10-main|4|3|1200"
  "ch11-main|16|9|1600"
  "ch12-main|4|3|1200"
  "closing-hero|3|4|900"
)

# ── Usage ──────────────────────────────────────────────────────────
if [[ -z "$INPUT_DIR" ]]; then
  echo ""
  echo "Anniversary Photo Processor"
  echo "==========================="
  echo ""
  echo "Usage: $0 <folder-of-photos>"
  echo ""
  echo "Photos must be named to match slot IDs. Expected names:"
  for slot_def in "${SLOTS[@]}"; do
    IFS='|' read -r slot_id _ _ _ <<< "$slot_def"
    echo "  ${slot_id}.jpg  (or .jpeg, .png, .heic, .webp)"
  done
  echo ""
  echo "Output goes to: assets/images/"
  echo ""
  exit 0
fi

if [[ ! -d "$INPUT_DIR" ]]; then
  echo "Error: folder not found: $INPUT_DIR" && exit 1
fi

if ! command -v sips &>/dev/null; then
  echo "Error: 'sips' not found. This script requires macOS." && exit 1
fi

mkdir -p "$OUTPUT_DIR"

HAS_CWEBP=false
command -v cwebp &>/dev/null && HAS_CWEBP=true

echo ""
echo "Anniversary Photo Processor"
echo "==========================="
echo "Input  : $INPUT_DIR"
echo "Output : $OUTPUT_DIR"
echo "Format : $(if $HAS_CWEBP; then echo 'WebP (cwebp found)'; else echo 'JPEG  (install cwebp for WebP: brew install webp)'; fi)"
echo ""

processed=0
skipped=0

# ── Process each slot ──────────────────────────────────────────────
for slot_def in "${SLOTS[@]}"; do
  IFS='|' read -r slot_id aspect_w aspect_h target_w <<< "$slot_def"
  target_h=$(( target_w * aspect_h / aspect_w ))

  # Find input file with any accepted extension
  input_file=""
  for ext in jpg jpeg png webp heic HEIC JPG JPEG PNG WEBP; do
    candidate="$INPUT_DIR/${slot_id}.${ext}"
    if [[ -f "$candidate" ]]; then
      input_file="$candidate"
      break
    fi
  done

  if [[ -z "$input_file" ]]; then
    echo "  SKIP  $slot_id  (no file found: expected ${slot_id}.jpg or similar)"
    (( skipped++ ))
    continue
  fi

  tmp_crop="/tmp/anniv_${slot_id}_crop.jpg"
  tmp_sized="/tmp/anniv_${slot_id}_sized.jpg"

  # Get source dimensions
  orig_w=$(sips -g pixelWidth  "$input_file" 2>/dev/null | awk '/pixelWidth/  {print $2}')
  orig_h=$(sips -g pixelHeight "$input_file" 2>/dev/null | awk '/pixelHeight/ {print $2}')

  if [[ -z "$orig_w" || -z "$orig_h" ]]; then
    echo "  FAIL  $slot_id  (could not read dimensions from $input_file)"
    (( skipped++ ))
    continue
  fi

  # Centre-crop to target aspect ratio
  if (( orig_w * aspect_h > orig_h * aspect_w )); then
    # Source wider than target: crop sides
    crop_h=$orig_h
    crop_w=$(( orig_h * aspect_w / aspect_h ))
    crop_x=$(( (orig_w - crop_w) / 2 ))
    crop_y=0
  else
    # Source taller than target: crop top/bottom
    crop_w=$orig_w
    crop_h=$(( orig_w * aspect_h / aspect_w ))
    crop_x=0
    crop_y=$(( (orig_h - crop_h) / 2 ))
  fi

  # Crop
  sips --cropToHeightWidth "$crop_h" "$crop_w" \
       --cropOffset "$crop_y" "$crop_x" \
       "$input_file" --out "$tmp_crop" &>/dev/null

  # Resize to target dimensions
  sips -z "$target_h" "$target_w" "$tmp_crop" --out "$tmp_sized" &>/dev/null

  # Output
  if $HAS_CWEBP; then
    out_file="$OUTPUT_DIR/${slot_id}.webp"
    cwebp -q 85 -quiet "$tmp_sized" -o "$out_file"
  else
    out_file="$OUTPUT_DIR/${slot_id}.jpg"
    cp "$tmp_sized" "$out_file"
    # Optimise JPEG quality with sips
    sips -s formatOptions 85 "$out_file" &>/dev/null || true
  fi

  rm -f "$tmp_crop" "$tmp_sized"

  out_name="$(basename "$out_file")"
  echo "  OK    $slot_id  ->  $out_name  (${target_w}x${target_h})"
  (( processed++ ))
done

echo ""
echo "Done: $processed processed, $skipped skipped."
echo ""

if (( processed > 0 )); then
  echo "Next steps:"
  echo "  1. For each processed file, add a 'src' field to its slot in content.js:"
  echo "     'ch1-main': { aspectRatio: '4/3', placeholder: '...', src: 'assets/images/ch1-main.jpg' }"
  echo "  2. Update buildPlaceholder() in main.js to render <img> when src is set (see PHOTOS.md)."
  echo "  3. Commit and push."
  echo ""
fi

if ! $HAS_CWEBP && (( processed > 0 )); then
  echo "Tip: install cwebp for smaller WebP output: brew install webp"
  echo ""
fi
