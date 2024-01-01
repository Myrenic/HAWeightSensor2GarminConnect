YAGCC kan uploaden via CLI, kan je gewoon je gegevens in vullen en gewicht en hij upload t.
nu nog in home assistant krijgen


YAGCC runt nu in docker compose op 10.0.0.3; 

version: "3.9"
services:
  YAGCC:
    container_name: YAGCC
    restart: unless-stopped
    image: lswiderski/yet-another-garmin-connect-client-api
    ports:
      - 555:80 


https://github.com/lswiderski/WebBodyComposition/blob/802e84d89ac7fd70f43e290fdf4b1f9171587e03/pages/sync/garmin.js#L4

 const payload =
        {
            timeStamp: -1,
            weight: parseFloat(weight),
            <!-- percentFat: parseFloat(fat ?? 0),
            percentHydration: parseFloat(waterPercentage ?? 0),
            boneMass: parseFloat(boneMass ?? 0),
            muscleMass: parseFloat(muscleMass ?? 0),
            visceralFatRating: parseFloat(visceralFat ?? 0),
            physiqueRating: parseFloat(bodyType ?? 0),
            metabolicAge: parseFloat(metabolicAge ?? 0),
            bodyMassIndex: parseFloat(bmi ?? 0), -->
            email,
            password,
        }

 headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }

