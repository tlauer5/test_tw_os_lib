const { createContract, read_sensor, read_merkle_root } = require("./blockchain/blockchain")
require('dotenv').config();


const DEFAULT_CONTRACT_ADDRESS = "0x3E6Cc08B22E0847dC5eB4c4E10B45165F25f36E5"
const DEFAULT_ABI = require("./blockchain/abi/Storage_V1.json");


async function verify_proof(provider_url, abi = DEFAULT_ABI, contract_address = DEFAULT_CONTRACT_ADDRESS) {
    const contract = createContract(provider_url, abi, contract_address)
    await read_sensor(contract)
    await read_merkle_root(contract)
}


// url = "https://eth-sepolia.g.alchemy.com/v2/7nTymTfOpNoXSQcYb_W2vNjvaWtB2Dp-"
// testing(url)


module.exports = {
    verify_proof
}