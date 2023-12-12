const axios = require('axios');

async function get_all_data (url) {
    try {
        const response = await axios.get(url)
        return response.data;
    } catch (error) {
        console.error(error.message);
        return undefined;
    }
}



module.exports = {
    get_all_data
};