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

- **DNS:** an `A` record for `budane.net` → your cluster's public IP, with ports
  **80 and 443 reachable from the internet** (cert-manager's HTTP-01 challenge
  and Let's Encrypt need port 80).
- **cert-manager** installed with a working `ClusterIssuer`. If yours isn't named
  `letsencrypt-prod`, edit `cert-manager.io/cluster-issuer` in `ingress.yaml`.

## 1. Build + import the image

Run on a cluster node (the image is loaded into k3s containerd, not a registry):

```bash
./k8s/build-and-import.sh
```

Multi-node cluster? Run it on every node, **or** pin the pod to one node:
uncomment `nodeSelector` in `deployment.yaml` and label that node:

```bash
kubectl label node <node-name> inspection-game/host=true
```

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
