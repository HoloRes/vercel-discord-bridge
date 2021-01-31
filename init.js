// Imports
// Packages
const axios = require("axios");

// Local files
const config = require("./config");

const body = {
    name: "Discord webhook",
    url: config.vercelWebhookUrl
};
const axiosConfig = {
    headers: { Authorization: `Bearer: ${config.vercelKey}` }
};

axios.post("https://api.vercel.com/v1/integrations/webhooks", body, axiosConfig)
    .then(() => {
        console.log("Webhook created succesfully.");
    })
    .catch((e) => {
        console.log("Failed to create webhook.");
        throw new Error(e);
    });