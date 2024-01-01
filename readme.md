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
    image: myrenic/HAWeightSensor2GarminConnect:latest
    environment:
      - HOME_ASSISTANT_API_URL=https://home.example.com
      - HOME_ASSISTANT_ACCESS_TOKEN=your_home_assistant_access_token
      - YAGCC_API_URL=http://10.0.0.3:555/upload
      - HOME_ASSISTANT_SENSOR=sensor.weight
      - GARMIN_EMAIL=your_garmin_email
      - GARMIN_PASSWORD=your_garmin_password
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
