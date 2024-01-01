const axios = require("axios");
require("dotenv").config();

const homeAssistantApiUrl = process.env.HOME_ASSISTANT_API_URL;
const yagccApiUrl = process.env.YAGCC_API_URL;
const weightSensorEntity = process.env.HOME_ASSISTANT_SENSOR;

const fetchSensorData = async () => {
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

    // Construct the payload for the YAGCC API
    const yagccPayload = {
      timeStamp: -1,
      weight: weight,
      email: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD,
    };

    // Send a POST request to the YAGCC API
    const yagccResponse = await axios.post(yagccApiUrl, yagccPayload);
    if (yagccResponse.status == 201) {
      console.log(
        `Successfully sent weight of ${weight} to the following garmin account: ${process.env.GARMIN_EMAIL}`
      );
    } else {
      console.log("YAGCC Response Status:", yagccResponse.status); // Log the HTTP status code
      console.log("YAGCC Response Data:", yagccResponse.data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

fetchSensorData();
