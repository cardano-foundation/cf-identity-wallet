VERSION 0.8

ARG --global DOCKER_IMAGES_TARGETS="keria vlei credential-server"

ARG --global KERIA_GIT_REPO_URL="https://github.com/WebOfTrust/keria.git"
ARG --global KERIA_GIT_REF=fb6009a7ceaf39f36bf63651f14fc5a53dc743d4

ARG --global VLEI_GIT_REPO_URL="https://github.com/WebOfTrust/vLEI.git"
ARG --global VLEI_GIT_REF="ed982313dab86bfada3825857601a10d71ce9631"

ARG --global ARIES_MEDIATOR_GIT_REPO_URL="https://github.com/hyperledger/aries-mediator-service.git"
ARG --global ARIES_MEDIATOR_GIT_REF="765914d969ea73854eae401795dbe85c64f8a115"

ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES=""
ARG --global HUB_DOCKER_COM_USER=cardanofoundation

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target
  END

docker-publish:
  ARG EARTHLY_GIT_SHORT_HASH
  WAIT
    BUILD +all
  END
  LOCALLY
  FOR registry IN $DOCKER_REGISTRIES
    FOR image_target IN $DOCKER_IMAGES_TARGETS
      IF [ ! -z "$DOCKER_IMAGES_EXTRA_TAGS" ]
        FOR image_tag IN $DOCKER_IMAGES_EXTRA_TAGS
          IF [ "$registry" = "hub.docker.com" ]
            RUN docker tag ${image_target}:latest ${HUB_DOCKER_COM_USER}/${image_target}:${image_tag}
            RUN docker push ${HUB_DOCKER_COM_USER}/${image_target}:${image_tag}
          ELSE
            RUN docker tag ${image_target}:latest ${registry}/${image_target}:${image_tag}
            RUN docker push ${registry}/${image_target}:${image_tag}
          END
        END
      END
      IF [ "$registry" = "hub.docker.com" ]
        RUN docker tag ${image_target}:latest ${HUB_DOCKER_COM_USER}/${image_target}:${EARTHLY_GIT_SHORT_HASH}
        RUN docker push ${HUB_DOCKER_COM_USER}/${image_target}:${EARTHLY_GIT_SHORT_HASH}
      ELSE
        RUN docker tag ${image_target}:latest ${registry}/${image_target}:${EARTHLY_GIT_SHORT_HASH}
        RUN docker push ${registry}/${image_target}:${EARTHLY_GIT_SHORT_HASH}
      END
    END
  END

keria-src:
  ARG KERIA_KERIPY_DEPEND_VERSION_OVERRIDE="keri @ git+https://git@github.com/weboftrust/keripy.git@efde86d303a9b6e26e6892e3350ea7a724ea8502"
  FROM alpine
  GIT CLONE --branch $KERIA_GIT_REF $KERIA_GIT_REPO_URL /keria
  RUN sed -i "s|'keri>=.*,$|'$KERIA_KERIPY_DEPEND_VERSION_OVERRIDE',|" /keria/setup.py
  SAVE ARTIFACT /keria

keria:
  ARG EARTHLY_TARGET_NAME
  FROM DOCKERFILE -f +keria-src/keria/images/keria.dockerfile +keria-src/keria/*
  ENTRYPOINT keria start --config-file backer-oobis --config-dir ./scripts
  SAVE IMAGE $EARTHLY_TARGET_NAME:$KERIA_GIT_REF
  SAVE IMAGE $EARTHLY_TARGET_NAME:latest

vlei-src:
  FROM scratch
  GIT CLONE --branch $VLEI_GIT_REF $VLEI_GIT_REPO_URL /vlei
  SAVE ARTIFACT /vlei

vlei:
  ARG EARTHLY_TARGET_NAME
  FROM DOCKERFILE -f +vlei-src/vlei/container/Dockerfile +vlei-src/vlei/*
  ENTRYPOINT vLEI-server -s ./schema/acdc -c ./samples/acdc/ -o ./samples/oobis/
  SAVE IMAGE $EARTHLY_TARGET_NAME:$VLEI_GIT_REF
  SAVE IMAGE $EARTHLY_TARGET_NAME:latest

mediator-src:
  FROM alpine
  GIT CLONE --branch $ARIES_MEDIATOR_GIT_REF $ARIES_MEDIATOR_GIT_REPO_URL /aries-mediator-service
  COPY ./docker-assets/mediator/Dockerfile /aries-mediator-service/afj/
  COPY ./docker-assets/mediator/yarn.lock /aries-mediator-service/afj/
  COPY ./docker-assets/mediator/tsconfig.json /aries-mediator-service/afj/
  RUN sed -i 's|"start":.*|"start": "node ./dist/src/mediator.js",|' /aries-mediator-service/afj/package.json
  SAVE ARTIFACT /aries-mediator-service

mediator-caddy:
  ARG EARTHLY_TARGET_NAME
  ARG CADDY_DOCKER_IMAGE_TAG=2.7.6
  FROM caddy:$CADDY_DOCKER_IMAGE_TAG
  COPY ./docker-assets/mediator/Caddyfile /etc/caddy/Caddyfile
  SAVE IMAGE $EARTHLY_TARGET_NAME

mediator:
  ARG EARTHLY_TARGET_NAME
  FROM DOCKERFILE -f +mediator-src/aries-mediator-service/afj/Dockerfile +mediator-src/aries-mediator-service/afj/*
  SAVE IMAGE $EARTHLY_TARGET_NAME:$ARIES_MEDIATOR_GIT_REF

credential-server:
  ARG EARTHLY_TARGET_NAME
  FROM DOCKERFILE ./services/credential-server
  SAVE IMAGE $EARTHLY_TARGET_NAME
