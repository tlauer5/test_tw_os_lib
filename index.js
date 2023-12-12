const { create_contract, read_sensor, read_merkle_root, read_all_events } = require("./blockchain/blockchain")
require('dotenv').config();

const DEFAULT_CONTRACT_ADDRESS = "0x1BB8678024C9B563b9b0b0E0B0737eFe92817a6b"
const DEFAULT_ABI = require("./blockchain/abi/abi.json");
const { get_all_data } = require("./data_fetcher/data_fetcher");
const { plot_data } = require("./data_plotter/data_plotter");
const { check_blocknumbers } = require("./data_verifier/data_verifier");

const DEFAULT_DATA_API_URL = "http://127.0.0.1:8000/read_table"


async function verify_proof (data, provider_url, abi = DEFAULT_ABI, contract_address = DEFAULT_CONTRACT_ADDRESS) {
    if (data && provider_url) {
        const contract = create_contract(provider_url, abi, contract_address)

        const events = await read_all_events(contract)

        const valid_blocknumbers = check_blocknumbers(data, events.merkleRootRequestedEvents);

        if (!valid_blocknumbers) return false;



        // console.log(events.merkleRootRequestedEvents)


        // await read_sensor(contract)
        // await read_merkle_root(contract)
        // console.log(data)
        // console.log(provider_url);
        return true;
    } else {
        console.log("Data or Provider URL is missing.");
        return false;
    }


}

async function data_from_website (api_url = DEFAULT_DATA_API_URL) {
    return get_all_data(api_url);
}

async function graph_for_data (data) {
    await plot_data(data);
}


module.exports = {
    verify_proof,
    data_from_website,
    graph_for_data
}