#!/usr/bin/env bash
# Build the image (arm64 when run on the Pi) and make it available to k3s
# containerd. Run this ON a cluster node. For a multi-node cluster, run it on
# each node OR pin the pod with the nodeSelector in deployment.yaml.
set -euo pipefail

IMAGE="inspection-game:latest"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v nerdctl >/dev/null 2>&1; then
  echo ">> Building straight into k3s containerd (k8s.io namespace) via nerdctl"
  sudo nerdctl --namespace k8s.io build -t "$IMAGE" .
  echo ">> Done. Image '$IMAGE' is ready for k3s."
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  echo ">> Building with docker, then importing the tarball into k3s containerd"
  docker build -t "$IMAGE" .
  TMP="$(mktemp -d)/inspection-game.tar"
  docker save "$IMAGE" -o "$TMP"
  sudo k3s ctr images import "$TMP"
  rm -f "$TMP"
  echo ">> Done. Image '$IMAGE' imported into k3s."
  exit 0
fi

echo "ERROR: need either nerdctl or docker on this node to build the image." >&2
exit 1
