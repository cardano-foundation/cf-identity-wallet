VERSION 0.8

ARG --global DOCKER_IMAGES_TARGETS="idw-keria idw-witness cred-issuance cred-issuance-ui"

ARG --global KERIA_GIT_REPO_URL="https://github.com/cardano-foundation/keria.git"
ARG --global KERIA_GIT_REF=03a1b13047f91f7f287e0a03d227084835db6616

ARG --global KERI_DOCKER_IMAGE_REPO=weboftrust/keri
ARG --global KERI_DOCKER_IMAGE_TAG=1.1.6

ARG --global DOCKER_IMAGE_PREFIX="cf"
ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES="hub.docker.com"
ARG --global HUB_DOCKER_COM_USER=cardanofoundation
ARG --global PUSH=false

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target --PUSH=$PUSH
  END

docker-publish:
  BUILD +all --PUSH=$PUSH

TEMPLATED_DOCKER_TAG_N_PUSH:
  FUNCTION
  ARG EARTHLY_GIT_SHORT_HASH
  ARG PUSH # we use this as --push is not supported in LOCALLY blocks
  ARG DOCKER_IMAGE_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  LOCALLY
  FOR registry IN $DOCKER_REGISTRIES
    FOR image_tag IN $DOCKER_IMAGES_EXTRA_TAGS
      IF [ "$registry" = "hub.docker.com" ]
        RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${image_tag}
        RUN if [ "$PUSH" = "true" ]; then docker push ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${image_tag}; fi
      ELSE
        RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${registry}/${DOCKER_IMAGE_NAME}:${image_tag}
        RUN if [ "$PUSH" = "true" ]; then docker push ${registry}/${DOCKER_IMAGE_NAME}:${image_tag}; fi
      END
    END
    IF [ "$registry" = "hub.docker.com" ]
      RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}
      RUN if [ "$PUSH" = "true" ]; then docker push ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}; fi
    ELSE
      RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${registry}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}
      RUN if [ "$PUSH" = "true" ]; then docker push ${registry}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}; fi
    END
  END

keria-src:
  FROM alpine/git
  RUN git clone $KERIA_GIT_REPO_URL /keria && \
      cd /keria && \
      git checkout $KERIA_GIT_REF
  SAVE ARTIFACT /keria

idw-keria:
  ARG EARTHLY_TARGET_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGE_PREFIX}-${EARTHLY_TARGET_NAME}

  LOCALLY
  ARG REGISTRY_IMAGE_EXISTS=$( ( docker manifest inspect ${HUB_DOCKER_COM_USER}/${EARTHLY_TARGET_NAME}:keria-${KERIA_GIT_REF} 2>/dev/null ) || echo false)
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
    DO +TEMPLATED_DOCKER_TAG_N_PUSH \
       --PUSH=$PUSH \
       --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
       --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS} keria-${KERIA_GIT_REF}"
  END

idw-witness:
  ARG EARTHLY_TARGET_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGE_PREFIX}-${EARTHLY_TARGET_NAME}

  LOCALLY
  ARG REGISTRY_IMAGE_EXISTS=$( (docker manifest inspect ${EARTHLY_TARGET_NAME}:keri-${KERI_DOCKER_IMAGE_TAG} 2> /dev/null | grep -q layers) || echo false)

  IF [ "${REGISTRY_IMAGE_EXISTS}" = "false" ]
    WAIT
      FROM ${KERI_DOCKER_IMAGE_REPO}:${KERI_DOCKER_IMAGE_TAG}
      ENV PYTHONUNBUFFERED=1
      ENV PYTHONIOENCODING=UTF-8
      ENTRYPOINT kli witness demo
    END
    WAIT
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:keri-${KERI_DOCKER_IMAGE_TAG}
      SAVE IMAGE ${DOCKER_IMAGE_NAME}:latest
    END
    DO +TEMPLATED_DOCKER_TAG_N_PUSH \
       --PUSH=$PUSH \
       --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
       --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS} keri-${KERI_DOCKER_IMAGE_TAG}"
  END

cred-issuance:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGE_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./services/credential-server
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO +TEMPLATED_DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

cred-issuance-ui:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGE_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./services/credential-server-ui
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO +TEMPLATED_DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"
