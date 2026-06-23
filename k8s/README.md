# Deploy to Kubernetes (k3s + Traefik) at budane.net

Single-replica deployment of the Inspection Readiness game on your k3s Pi
cluster, served at **https://budane.net** with TLS from cert-manager.

> ⚠️ **In-memory state:** one replica only, and a redeploy resets the live game.
> Deploy/reset **before** a workshop session, never during one.

## Prerequisites (check these first)

```bash
kubectl get clusterissuer          # confirm your cert-manager issuer name
kubectl -n kube-system get pods | grep traefik   # confirm Traefik is running
```

- **DNS:** `budane.net` resolves to the cluster's public IP, and ports **443**
  (app) **+ 80** (http→https redirect) are reachable from the internet.
- **cert-manager** installed with a working `ClusterIssuer`. If yours isn't named
  `letsencrypt-prod`, edit `cert-manager.io/cluster-issuer` in `ingress.yaml`.
- **This cluster's `letsencrypt-prod` uses Cloudflare DNS-01** (not HTTP-01),
  scoped by a `dnsZones` selector. So for a new domain you must, one time:
  1. **Add the domain to the issuer's solver selector:**
     ```bash
     kubectl patch clusterissuer letsencrypt-prod --type=json \
       -p='[{"op":"add","path":"/spec/acme/solvers/0/selector/dnsZones/-","value":"budane.net"}]'
     ```
  2. **Add the domain to the Cloudflare API token** behind the
     `cloudflare-api-token` secret (Cloudflare dashboard → API Tokens → edit →
     Zone Resources → add the zone, with `Zone:Read` + `DNS:Edit`). Editing keeps
     the token value, so no secret change is needed.
  Without **both**, the ACME order fails with *"no configured challenge solvers"*
  or *"Found no Zones for domain"* and the cert never issues.

## 1. Build + import the image

The image is loaded into k3s containerd on **one node** (not a registry), and the
Deployment is pinned to that node (`nodeSelector: kubernetes.io/hostname: pi-server`).

If the node has **no image builder**, run this (installs nerdctl+buildkit, then
builds straight into k3s containerd). Must run as root on the pinned node:

```bash
sudo bash k8s/install-builder-and-build.sh
```

If a builder is already present (docker or nerdctl), the lighter script works too:

```bash
./k8s/build-and-import.sh
```

Pinning to a different node? Change `kubernetes.io/hostname` in `deployment.yaml`
to that node's name and build there.

## 2. Apply the manifests

```bash
kubectl apply -k k8s/
```

(Equivalent to applying namespace → deployment → service → ingress.)

## 3. Watch it come up

```bash
kubectl -n inspection-game get pods -w
kubectl -n inspection-game get ingress
kubectl get certificate -n inspection-game          # wait for READY=True
```

First TLS issuance takes ~1–2 min. Then open **https://budane.net**.

## Operate

```bash
# Reset before a new session (also re-pulls latest image build)
kubectl -n inspection-game rollout restart deploy/inspection-game

# After rebuilding the image with a new tag, update and roll:
#   edit image: in deployment.yaml, then:
kubectl apply -k k8s/

# Logs
kubectl -n inspection-game logs deploy/inspection-game -f

# Tear down
kubectl delete -k k8s/
```

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Pod `ErrImageNeverPull` | Image not imported on the node the pod landed on → run build-and-import there, or use the `nodeSelector` pin. |
| Cert stuck `READY=False` | DNS not pointing at the cluster yet, or port 80 not reachable for HTTP-01. `kubectl describe certificate -n inspection-game`. |
| Drag-and-drop doesn't sync between teammates | WebSocket not passing through — confirm you're hitting Traefik (not another proxy) and the Ingress `ingressClassName: traefik`. |
| Board resets unexpectedly | The pod restarted (OOM/redeploy). State is in-memory by design. |

## What's deployed

| Manifest | Purpose |
|----------|---------|
| `namespace.yaml` | `inspection-game` namespace |
| `deployment.yaml` | 1 replica, `imagePullPolicy: Never`, health probes, `Recreate` strategy |
| `service.yaml` | ClusterIP `:80` → container `:8080` |
| `ingress.yaml` | Traefik Ingress for `budane.net` + cert-manager TLS + http→https redirect |
| `kustomization.yaml` | Applies them all with `kubectl apply -k` |
