#!/bin/bash

set -euxo pipefail

MEDIATOR_URL="http://localhost:2015"

echo "Starting agent with endpoint(s): ${MEDIATOR_URL} wss://${MEDIATOR_URL#*://*}"

aca-py start \
    --auto-provision \
    --arg-file ${MEDIATOR_ARG_FILE} \
    --label "${MEDIATOR_AGENT_LABEL}" \
    --inbound-transport http 0.0.0.0 ${MEDIATOR_AGENT_HTTP_IN_PORT} \
    --inbound-transport ws 0.0.0.0 ${MEDIATOR_AGENT_WS_IN_PORT} \
    --outbound-transport ws \
    --outbound-transport http \
    --emit-new-didcomm-prefix \
    --wallet-type indy \
    --wallet-storage-type postgres_storage \
    --admin 0.0.0.0 ${MEDIATOR_AGENT_HTTP_ADMIN_PORT} \
    --admin-api-key ${MEDIATOR_AGENT_ADMIN_API_KEY} \
    --endpoint ${MEDIATOR_URL} ws://${MEDIATOR_URL#*://*}
