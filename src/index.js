const axios = require("axios");
const Metrics = require("./metrics.js");
require("dotenv").config();

console.log("# | Script started");

const height = process.env.USER_HEIGHT;
const age = process.env.USER_AGE;
const sex = process.env.USER_SEX;
const homeAssistantApiUrl = process.env.HOME_ASSISTANT_API_URL;
const yagccApiUrl = process.env.YAGCC_API_URL;
const weightSensorEntity = process.env.HOME_ASSISTANT_WEIGHT_SENSOR;
const impedanceSensorEntity = process.env.HOME_ASSISTANT_IMPEDANCE_SENSOR;
const pollingInterval = process.env.POLLING_INTERVAL || 10000; // Default: 5 minutes
let lastUpdatedTimestamp = null;

// Function to calculate body composition metrics using the Metrics class
const calculateBodyComposition = (weight, impedance, height, age, sex) => {
  const metricsInstance = new Metrics(weight, impedance, height, age, sex);
  return metricsInstance.getResult();
};

const fetchSensorData = async () => {
  console.log("# | Running loop");
  try {
    const weightResponse = await axios.get(
      `${homeAssistantApiUrl}/api/states/${weightSensorEntity}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
        },
      }
    );
    const impedanceResponse = await axios.get(
      `${homeAssistantApiUrl}/api/states/${impedanceSensorEntity}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
        },
      }
    );

    const weight = parseFloat(weightResponse.data.state);
    const impedance = parseFloat(impedanceResponse.data.state);
    const currentLastUpdated = new Date(
      weightResponse.data.last_updated
    ).getTime();
    // Check if the value has been updated since the last check
    if (
      lastUpdatedTimestamp !== null &&
      currentLastUpdated <= lastUpdatedTimestamp
    ) {
      console.log(
        "# | Sensor value has not been updated since the last check."
      );
      return;
    }

    lastUpdatedTimestamp = currentLastUpdated;

    // Calculate body composition metrics
    const bodyComposition = calculateBodyComposition(
      weight,
      impedance,
      height,
      age,
      sex
    );
    // Destructure bodyComposition object for the payload
    const {
      bmi,
      fat,
      waterPercentage,
      boneMass,
      muscleMass,
      visceralFat,
      bodyType,
      metabolicAge,
    } = bodyComposition;
    // Construct the payload for the YAGCC API
    const yagccPayload = {
      timeStamp: -1,
      weight: parseFloat(weight),
      percentFat: parseFloat(fat.value ?? 0),
      percentHydration: parseFloat(waterPercentage.value ?? 0),
      boneMass: parseFloat(boneMass.value ?? 0),
      muscleMass: parseFloat(muscleMass.value ?? 0),
      visceralFatRating: parseFloat(visceralFat.value ?? 0),
      physiqueRating: parseFloat(bodyType.value ?? 0),
      metabolicAge: parseFloat(metabolicAge.value ?? 0),
      bodyMassIndex: parseFloat(bmi.value ?? 0),
      email: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD,
    };
    // Send a POST request to the YAGCC API
    const yagccResponse = await axios.post(yagccApiUrl, yagccPayload);
    if (yagccResponse.status === 201) {
      console.log(
        `# | Successfully sent weight of ${weight} to the following Garmin account: ${process.env.GARMIN_EMAIL}`
      );
    } else {
      console.log("# | YAGCC Response Status:", yagccResponse.status); // Log the HTTP status code
      console.log("# | YAGCC Response Data:", yagccResponse.data);
    }
  } catch (error) {
    console.error("# | Error:", error.message);
  }

  console.log("# | Closing loop");
};

const runScript = async () => {
  while (true) {
    await fetchSensorData();
    console.log("# | Sleeping for 5 mins");
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
  }
};

runScript();
