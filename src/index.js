const { exec } = require("child_process");
require("dotenv").config();
const axios = require("axios");

const homeAssistantApiUrl = process.env.HOME_ASSISTANT_API_URL;
const garminBinaryPath = "./src/helpers/YAGCC"; // Adjust the path as needed

const fetchSensorData = async () => {
  try {
    const response = await axios.get(
      `${homeAssistantApiUrl}/api/states/sensor.your_sensor`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
        },
      }
    );

    const sensorData = response.data.state;
    console.log("Sensor Data:", sensorData);

    // Construct the command to execute YAGCC with the desired data
    // const command = `${garminBinaryPath} uploadbodycomposition --weight 81 --bone-mass 14 --fat 13 --hydration 58 --muscle-mass 42 --email ${process.env.GARMIN_EMAIL} -p ${process.env.GARMIN_PASSWORD}`;
    const command = `${garminBinaryPath} uploadbodycomposition --weight 81 --email ${process.env.GARMIN_EMAIL} -p ${process.env.GARMIN_PASSWORD}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing YAGCC: ${error.message}`);
        return;
      }
      console.log("YAGCC Output:", stdout);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
};

fetchSensorData();
