#!/bin/sh
echo "window._env_ = {" > ./env-config.js
for var in $(env | grep ^VITE_); do
  echo "  \"${var%%=*}\": \"${var#*=}\"," >> ./env-config.js
done
echo "};" >> ./env-config.js
