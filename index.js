// quick-ip.js
const axios = require('axios');

async function getMyIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        console.log(`Your IP Address: ${response.data.ip}`);
    } catch (error) {
        console.log('Error getting IP:', error.message);
    }
}

getMyIP();