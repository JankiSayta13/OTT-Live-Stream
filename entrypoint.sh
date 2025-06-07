#!/usr/bin/env sh
set -e

# 1) pick up HOST_IP (fall back to 127.0.0.1 if not provided)
: "${HOST_IP:=127.0.0.1}"
echo "▶ Generating a dev cert for IP: $HOST_IP"

# 2) write cert+key into your project’s certs/ folder
mkdir -p /app/certs
openssl req -x509 -nodes -newkey rsa:2048 \
  -days 365 \
  -subj "/CN=$HOST_IP" \
  -addext "subjectAltName=IP:$HOST_IP" \
  -keyout /app/certs/localhost-key.pem \
  -out    /app/certs/localhost.pem

echo "✔ Certificate ready at /app/certs/localhost.pem"

# 3) Launch the dev server *without* --https flags
#    Vite will pull host/port/https from vite.config.ts
exec npm run dev
