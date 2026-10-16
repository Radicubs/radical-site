#!/usr/bin/env bash
# Re-encodes a clip for the homepage season preview, which scrubs currentTime as
# the page scrolls. Every frame is a keyframe, so each seek decodes one frame
# instead of everything since the last keyframe. Audio is dropped.
#
#   scripts/encode-scroll-video.sh input.mp4            -> input-scroll.mp4 (desktop, 1080p)
#   scripts/encode-scroll-video.sh input.mp4 --mobile   -> input-scroll-m.mp4 (720px wide)
#
# Upload the results to the Season preview video fields in the CMS. Needs ffmpeg.
set -euo pipefail

input="${1:?usage: $0 input.mp4 [--mobile]}"
base="${input%.*}"
args=(-an -c:v libx264 -preset slow -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p
  -profile:v high -tune film -movflags +faststart -r 30)

if [[ "${2:-}" == "--mobile" ]]; then
  ffmpeg -y -i "$input" -vf "scale=720:-2:flags=lanczos" "${args[@]}" -crf 23 "$base-scroll-m.mp4"
else
  ffmpeg -y -i "$input" -vf "scale=-2:'min(1080,ih)':flags=lanczos" "${args[@]}" -crf 24 "$base-scroll.mp4"
fi
