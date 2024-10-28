VERSION 0.8

IMPORT --allow-privileged github.com/cardano-foundation/cf-gha-workflows/./earthfiles/functions:main AS functions

ARG --global DOCKER_IMAGES_TARGETS="idw-keria idw-witness cred-issuance cred-issuance-ui"

ARG --global DOCKER_IMAGES_PREFIX="cf"
ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES=""
ARG --global RELEASE_TAG=""
ARG --global PUSH=false

ARG --global KERIA_GIT_REPO_URL="https://github.com/WebOfTrust/keria.git"
ARG --global KERIA_GIT_REF=e8bc173437ac91a88abebc3bc8c6b7f07885da68

ARG --global KERI_DOCKER_IMAGE_REPO=weboftrust/keri
ARG --global KERI_DOCKER_IMAGE_TAG=1.1.6

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target --PUSH=$PUSH
  END

docker-publish:
  BUILD +all --PUSH=$PUSH

keria-src:
  FROM alpine/git
  RUN git clone $KERIA_GIT_REPO_URL /keria && \
      cd /keria && \
      git checkout $KERIA_GIT_REF
  SAVE ARTIFACT /keria

idw-keria:
  ARG EARTHLY_TARGET_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  ARG FORCE_BUILD=false
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  LOCALLY
  IF [ "${FORCE_BUILD}" = "false" ]
    ARG REGISTRY_IMAGE_EXISTS=$( ( docker manifest inspect ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:keria-${KERIA_GIT_REF} 2>/dev/null | grep -q layers ) || echo false)
  ELSE
    ARG REGISTRY_IMAGE_EXISTS=false
  END

  IF [ "${REGISTRY_IMAGE_EXISTS}" = "false" ]
    WAIT
      FROM DOCKERFILE -f +keria-src/keria/images/keria.dockerfile +keria-src/keria/*
      RUN apk add --no-cache jq envsubst
      ENTRYPOINT keria start --config-file backer-oobis --config-dir ./scripts
    END
    WAIT
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:$KERIA_GIT_REF
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:latest
    END
    DO functions+DOCKER_TAG_N_PUSH \
       --PUSH=$PUSH \
       --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
       --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS} keria-${KERIA_GIT_REF}"
  END

idw-witness:
  ARG EARTHLY_TARGET_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  ARG FORCE_BUILD=false
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  LOCALLY
  IF [ "${FORCE_BUILD}" = "false" ]
    ARG REGISTRY_IMAGE_EXISTS=$( (docker manifest inspect ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:keri-${KERI_DOCKER_IMAGE_TAG} 2> /dev/null | grep -q layers) || echo false)
  ELSE
    ARG REGISTRY_IMAGE_EXISTS=false
  END

  IF [ "${REGISTRY_IMAGE_EXISTS}" = "false" ]
    WAIT
      FROM ${KERI_DOCKER_IMAGE_REPO}:${KERI_DOCKER_IMAGE_TAG}
      ENV PYTHONUNBUFFERED=1
      ENV PYTHONIOENCODING=UTF-8
      RUN apk add --no-cache jq envsubst
      ENTRYPOINT kli witness demo
    END
    WAIT
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:keri-${KERI_DOCKER_IMAGE_TAG}
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:latest
    END
    DO functions+DOCKER_TAG_N_PUSH \
       --PUSH=$PUSH \
       --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
       --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS} keri-${KERI_DOCKER_IMAGE_TAG}"
  END

cred-issuance:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./services/credential-server
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

cred-issuance-ui:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./services/credential-server-ui
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"
