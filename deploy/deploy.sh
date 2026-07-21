#!/usr/bin/env bash
# Deploy 18:59 en el VPS (EasyPanel / Docker Swarm + Traefik)
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/18-59}"
STACK_NAME="${STACK_NAME:-app1859}"
IMAGE="${IMAGE:-app1859-web:latest}"
DOMAIN="${DOMAIN:-18-59.grisbope.com}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/grisbope/18-59.git}"

echo "==> [18:59] deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ ! -d .git ]; then
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" .
else
  git remote set-url origin "$REPO_URL" || true
  git fetch --depth 1 origin "$BRANCH"
  git checkout -B "$BRANCH" "origin/$BRANCH"
  git reset --hard "origin/$BRANCH"
  git clean -fd -e .env.production -e .env.local
fi

if [ -f "$APP_DIR/.env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env.production"
  set +a
fi

echo "==> docker build $IMAGE"
docker build -t "$IMAGE" .

docker network inspect easypanel >/dev/null 2>&1 || \
  docker network create --driver overlay --attachable easypanel

TRAEFIK_CUSTOM="/etc/easypanel/traefik/config/custom.yaml"
if [ -f "$TRAEFIK_CUSTOM" ] && ! grep -q "18-59.grisbope.com" "$TRAEFIK_CUSTOM"; then
  echo "==> registrando rutas Traefik para $DOMAIN"
  cp "$TRAEFIK_CUSTOM" "${TRAEFIK_CUSTOM}.bak.$(date +%s)"
  python3 - <<'PY'
from pathlib import Path
p = Path("/etc/easypanel/traefik/config/custom.yaml")
text = p.read_text()
if "18-59.grisbope.com" in text:
    print("already present")
    raise SystemExit(0)
router_block = """    http-app1859:
      rule: Host(`18-59.grisbope.com`)
      service: app1859-web
      entryPoints:
      - http
      middlewares:
      - redirect-to-https
      priority: 100
    https-app1859:
      rule: Host(`18-59.grisbope.com`)
      service: app1859-web
      entryPoints:
      - https
      tls:
        certResolver: letsencrypt
      priority: 100
"""
service_block = """    app1859-web:
      loadBalancer:
        servers:
        - url: http://app1859_web:3000
"""
if "  routers:" in text:
    text = text.replace("  routers:\n", "  routers:\n" + router_block, 1)
else:
    # insert under http:
    text = text.replace("http:\n", "http:\n  routers:\n" + router_block, 1)
if "  services:" in text:
    text = text.replace("  services:\n", "  services:\n" + service_block, 1)
else:
    text += "\n  services:\n" + service_block
p.write_text(text)
print("Traefik custom.yaml updated")
PY
fi

echo "==> docker stack deploy $STACK_NAME"
# Export env for compose interpolation
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

docker stack deploy -c deploy/docker-compose.yml "$STACK_NAME"

echo "==> esperando réplica 1/1..."
ok=0
for i in $(seq 1 60); do
  reps=$(docker service ls --filter name=${STACK_NAME}_web --format '{{.Replicas}}' || true)
  echo "  attempt $i: $reps"
  if echo "$reps" | grep -qE '1/1'; then
    ok=1
    break
  fi
  sleep 3
done

docker service ps ${STACK_NAME}_web --no-trunc 2>/dev/null | head -5 || true
echo "==> health"
curl -skI -H "Host: $DOMAIN" https://127.0.0.1/ | head -10 || true
if [ "$ok" -eq 1 ]; then
  echo "==> [18:59] deploy OK → https://$DOMAIN"
else
  echo "==> [18:59] servicio aún no estable; revisa: docker service logs ${STACK_NAME}_web"
  exit 1
fi
