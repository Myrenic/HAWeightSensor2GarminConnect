# Send Home Assistant variable to Garmin using YAGCC.


## Compose example: 
version: "3.9"

services:
  node-app:
    container_name: node-docker
    image: myrenic/hasensor2garminconnect:latest
    environment:
      - HOME_ASSISTANT_API_URL=https://home.example.com
      - HOME_ASSISTANT_ACCESS_TOKEN=your_home_assistant_access_token
      - YAGCC_API_URL=http://YAGCC:/upload
      - HOME_ASSISTANT_SENSOR=sensor.weight
      - GARMIN_EMAIL=your_garmin_email
      - GARMIN_PASSWORD=your_garmin_password
    depends_on:
      - yagcc-api

  yagcc-api:
    container_name: YAGCC
    restart: unless-stopped
    image: lswiderski/yet-another-garmin-connect-client-api

