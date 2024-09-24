# Archived
Note: This repository is no longer actively maintained. I have transitioned to using native automations to post body metrics to YAGCC. Below is an example configuration:

```yaml
rest_command:
  send_bodymetrics_to_yagcc:
    url: "http://[ip:port]/upload"
    method: POST
    headers:
      Content-Type: "application/json"
    payload: >
      {
        "timeStamp": -1,
        "weight": {{ states('sensor.body_weight') }},
        "email": !secret garmin_email,
        "password": !secret garmin_password,
        "percentFat": {{ states('sensor.body_body_fat') }},
        "percentHydration": {{ states('sensor.body_water') }},
        "boneMass": {{ states('sensor.body_bone_mass') }},
        "muscleMass": {{ states('sensor.body_muscle_mass') }},
        "visceralFatRating": {{ states('sensor.body_visceral_fat') }},
        "metabolicAge": {{ states('sensor.body_metabolic_age') }},
        "bodyMassIndex": {{ states('sensor.body_bmi') }}
      }
```    

# HAWeightSensor2GarminConnect

Docker Compose Configuration for Syncing Weight Data from Home Assistant to Garmin Connect.

## Overview

This project facilitates seamless integration between Home Assistant and Garmin Connect, enabling the synchronization of weight data. If you own a scale that reports to Home Assistant, this setup ensures compatibility with Garmin Connect.

## Motivation

Inspired by the need to integrate my Mi Scale data with Garmin Connect, I developed this tool. Now, any scale that writes to Home Assistant can effortlessly share its data with Garmin.

## Docker-Compose Example

```yaml
version: "3.9"

services:
  node-app:
    container_name: HAWeightSensor2GarminConnect
    image: ghcr.io/myrenic/haweightsensor2garminconnect:main
    environment:
      - HOME_ASSISTANT_API_URL=
      - HOME_ASSISTANT_ACCESS_TOKEN=
      - HOME_ASSISTANT_WEIGHT_SENSOR=
      - HOME_ASSISTANT_IMPEDANCE_SENSOR=
      - YAGCC_API_URL=http://local-ip:555/upload
      - GARMIN_EMAIL=
      - GARMIN_PASSWORD=
      - USER_HEIGHT=190 # height in CM
      - USER_SEX=male #or use female
      - USER_AGE=24 
      - POLLING_INTERVAL=1800000 # interval in ms
      - DEBUG_MODE=true
    depends_on:
      - yagcc-api

 yagcc-api:
    container_name: YAGCC
    restart: unless-stopped
    image: lswiderski/yet-another-garmin-connect-client-api
    ports:
      - 555:80
```


## Credits
I drew inspiration from the following repository on how to send the POST request to YAGCC:
WebBodyComposition by lswiderski (https://github.com/lswiderski/WebBodyComposition)

The cornerstone of this integration, this client takes on the heavy lifting, bridging the gap in the absence of a Garmin API:
Yet Another Garmin Connect Client by lswiderski (https://github.com/lswiderski/yet-another-garmin-connect-client)
