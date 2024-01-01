const axios = require("axios");
require("dotenv").config();

console.log("# | Script started");

const homeAssistantApiUrl = process.env.HOME_ASSISTANT_API_URL;
const yagccApiUrl = process.env.YAGCC_API_URL;
const weightSensorEntity = process.env.HOME_ASSISTANT_SENSOR;
const pollingInterval = process.env.POLLING_INTERVAL || 300000; // Default: 5 minutes
let lastUpdatedTimestamp = null;

const fetchSensorData = async () => {
  console.log("# | Running loop");
  try {
    const response = await axios.get(
      `${homeAssistantApiUrl}/api/states/${weightSensorEntity}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
        },
      }
    );
    const weight = parseFloat(response.data.state);
    const currentLastUpdated = new Date(response.data.last_updated).getTime();

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

    // Construct the payload for the YAGCC API
    const yagccPayload = {
      timeStamp: -1,
      weight: weight,
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
