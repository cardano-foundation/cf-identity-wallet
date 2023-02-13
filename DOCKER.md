# Run locally

* Just run:
```
docker-compose up
```
## Access
* App: http://localhost:3001
* Tracker: http://localhost:8000/stats

# Run exposed publicly

* Copy `.env.example` to, ie, `.env.production` and customize the serving hostnames
* Ensure the DNS for the hostnames configured in the env file exists and point to the IP where you are running these docker containers
* Ensure ports 80 and 443 are exposed to the internet from the instance you are running docker
* Define `$ENVIRONMENT` env var. It will set which env file to use:
```
export ENVIRONMENT=production
```
* Bring everything up:
```
docker-compose \
  --env-file .env.${ENVIRONMENT} \
  -f docker-compose-public.yml \
  up -d
```

## Access
