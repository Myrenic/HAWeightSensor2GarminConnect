const axios = require("axios");
const Metrics = require("./metrics.js");
require("dotenv").config();

const DEBUG_MODE = process.env.DEBUG_MODE === "true"; // Added debug flag

console.log("# | Script started");

const height = parseFloat(process.env.USER_HEIGHT); // Parse float for consistency
const age = parseFloat(process.env.USER_AGE); // Parse float for consistency
const sex = process.env.USER_SEX;
const homeAssistantApiUrl = process.env.HOME_ASSISTANT_API_URL;
const yagccApiUrl = process.env.YAGCC_API_URL;
const weightSensorEntity = process.env.HOME_ASSISTANT_WEIGHT_SENSOR;
const impedanceSensorEntity = process.env.HOME_ASSISTANT_IMPEDANCE_SENSOR;
const pollingInterval = process.env.POLLING_INTERVAL || 300000;
let lastUpdatedTimestamp = null;

// Function to calculate body composition metrics using the Metrics class
const calculateBodyComposition = (weight, impedance, height, age, sex) => {
  const metricsInstance = new Metrics(weight, impedance, height, age, sex);
  return metricsInstance.getResult();
};

const fetchSensorData = async () => {
  if (DEBUG_MODE) console.log("# | Running loop"); // Debug message

  try {
    // Check if weight sensor exists
    if (!weightSensorEntity) {
      console.log(
        "# | Weight sensor not provided. Skipping weight measurement."
      );
      return;
    }

    const weightResponse = await axios.get(
      `${homeAssistantApiUrl}/api/states/${weightSensorEntity}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
        },
      }
    );

    const weight = parseFloat(weightResponse.data.state);
    const currentLastUpdated = new Date(
      weightResponse.data.last_updated
    ).getTime();
    // Check if the value has been updated since the last check
    if (
      lastUpdatedTimestamp !== null &&
      currentLastUpdated <= lastUpdatedTimestamp
    ) {
      if (DEBUG_MODE)
        console.log(
          "# | Sensor value has not been updated since the last check."
        ); // Debug message
      return;
    }

    lastUpdatedTimestamp = currentLastUpdated;

    let yagccPayload = {
      timeStamp: -1,
      weight: parseFloat(weight),
      email: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD,
    };

    let sentVariables = ["Weight"]; // List of sent variables

    // Check if impedance sensor exists
    if (impedanceSensorEntity) {
      const impedanceResponse = await axios.get(
        `${homeAssistantApiUrl}/api/states/${impedanceSensorEntity}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
          },
        }
      );
      const impedance = parseFloat(impedanceResponse.data.state);

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
      // Add body composition fields to the payload
      yagccPayload = {
        ...yagccPayload,
        percentFat: parseFloat(fat.value ?? 0),
        percentHydration: parseFloat(waterPercentage.value ?? 0),
        boneMass: parseFloat(boneMass.value ?? 0),
        muscleMass: parseFloat(muscleMass.value ?? 0),
        visceralFatRating: parseFloat(visceralFat.value ?? 0),
        physiqueRating: parseFloat(bodyType.value ?? 0),
        metabolicAge: parseFloat(metabolicAge.value ?? 0),
        bodyMassIndex: parseFloat(bmi.value ?? 0),
      };

      sentVariables.push(
        "Percent Fat",
        "Percent Hydration",
        "Bone Mass",
        "Muscle Mass",
        "Visceral Fat Rating",
        "Physique Rating",
        "Metabolic Age",
        "Body Mass Index"
      );
    }

    // Send a POST request to the YAGCC API
    const yagccResponse = await axios.post(yagccApiUrl, yagccPayload);
    if (yagccResponse.status === 201) {
      console.log(
        `# | Successfully sent weight of ${weight} to the following Garmin account: ${process.env.GARMIN_EMAIL}`
      );
      if (impedanceSensorEntity) {
        console.log("# | Sent variables to Garmin:", sentVariables.join(", "));
      }
    } else {
      console.log("# | YAGCC Response Status:", yagccResponse.status); // Log the HTTP status code
      console.log("# | YAGCC Response Data:", yagccResponse.data);
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        if (error.response.config.url.includes(weightSensorEntity)) {
          console.log(
            `# | Weight sensor not found: ${error.response.data.message}`
          );
        } else if (error.response.config.url.includes(impedanceSensorEntity)) {
          console.log(
            `# | Impedance sensor not found: ${error.response.data.message}`
          );
        } else {
          console.log(`# | Sensor not found: ${error.response.data.message}`);
        }
      } else {
        console.log(
          `# | Request failed with status code: ${error.response.status}`
        );
      }
    } else if (error.request) {
      console.log("# | Request error:", error.request);
    } else {
      console.error("# | Error:", error.message);
    }
  }

  if (DEBUG_MODE) console.log("# | Closing loop"); // Debug message
};

const runScript = async () => {
  while (true) {
    await fetchSensorData();
    const pollingIntervalFormatted =
      pollingInterval >= 60000
        ? pollingInterval / 60000 + " mins"
        : pollingInterval / 1000 + " seconds";
    console.log(`# | Sleeping for ${pollingIntervalFormatted}`);
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
  }
};

runScript();
