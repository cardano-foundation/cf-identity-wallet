#!/bin/sh

cat > envfile.js <<EOF
window.__RUNTIME_CONFIG__ = {
  SERVER_URL: "${VITE_SERVER_URL}",
};
EOF
