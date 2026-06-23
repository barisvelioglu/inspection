#!/usr/bin/env bash
# Run as root ON pi-server. Installs nerdctl-full (incl. buildkit), then builds
# the app image straight into k3s's containerd (k8s.io namespace) so the
# Deployment (imagePullPolicy: Never, pinned to pi-server) can run it.
set -euo pipefail

IMAGE="inspection-game:latest"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
K3S_SOCK="/run/k3s/containerd/containerd.sock"

ARCH="$(uname -m)"
case "$ARCH" in
  aarch64|arm64) GOARCH="arm64" ;;
  x86_64|amd64)  GOARCH="amd64" ;;
  *) echo "unsupported arch: $ARCH" >&2; exit 1 ;;
esac

if ! command -v nerdctl >/dev/null 2>&1; then
  echo ">> Resolving latest nerdctl release..."
  TAG="$(curl -fsSL https://api.github.com/repos/containerd/nerdctl/releases/latest | grep -oP '"tag_name":\s*"\K[^"]+')"
  VER="${TAG#v}"
  URL="https://github.com/containerd/nerdctl/releases/download/${TAG}/nerdctl-full-${VER}-linux-${GOARCH}.tar.gz"
  echo ">> Downloading $URL"
  curl -fL "$URL" -o /tmp/nerdctl-full.tgz
  echo ">> Installing into /usr/local (does NOT touch k3s's own containerd)"
  tar -C /usr/local -xzf /tmp/nerdctl-full.tgz
  rm -f /tmp/nerdctl-full.tgz
fi

echo ">> Starting buildkit (oci worker)"
systemctl daemon-reload || true
systemctl enable --now buildkit 2>/dev/null || {
  echo ">> systemd buildkit unit unavailable; starting buildkitd manually"
  pgrep -x buildkitd >/dev/null || (/usr/local/bin/buildkitd --oci-worker=true --containerd-worker=false >/var/log/buildkitd.log 2>&1 &)
  sleep 3
}

echo ">> Building $IMAGE into k3s containerd (this takes several minutes on a Pi)"
cd "$REPO_DIR"
nerdctl --address "$K3S_SOCK" --namespace k8s.io build -t "$IMAGE" .

echo ">> Verifying image is visible to k3s:"
nerdctl --address "$K3S_SOCK" --namespace k8s.io images | grep inspection-game || true
echo ">> DONE. Image '$IMAGE' is ready on pi-server."
