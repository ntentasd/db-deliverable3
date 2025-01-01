#!/bin/bash

echo "Creating runtime environment variables..."

# Create env.js for React
cat <<EOF > /usr/share/nginx/html/env.js
window.env = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL}",
};
EOF

echo "Starting Nginx..."
nginx -g "daemon off;"
