const { create_contract, read_sensor, read_merkle_root, read_all_events } = require("./blockchain/blockchain")
require('dotenv').config();
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const DEFAULT_CONTRACT_ADDRESS = "0x96347d982759b643997A1813D14Db1F606aa9ad4"
const DEFAULT_ABI = require("./blockchain/abi/abi.json");
const { get_all_data } = require("./data_fetcher/data_fetcher");
const { plot_data } = require("./data_plotter/data_plotter");
const { check_blocknumbers, assign_data_for_verification } = require("./data_verifier/data_verifier");
const { generate_leaf } = require("./ipfs/ipfs");

const DEFAULT_DATA_API_URL = "http://127.0.0.1:8000/read_table"


const general = {
    base_ipfs_url: "https://ipfs.io/ipfs/",
    temperature_unit: "°C",
    humidity_unit: "%",
    chain_id: 80001,
    contract_address: "0x96347d982759b643997A1813D14Db1F606aa9ad4",
}

async function verify_proof (data, provider_url, abi = DEFAULT_ABI, contract_address = DEFAULT_CONTRACT_ADDRESS) {
    if (data && provider_url) {
        const contract = create_contract(provider_url, abi, contract_address)

        const events = await read_all_events(contract)

        const valid_blocknumbers = check_blocknumbers(data, events.merkleRootRequestedEvents);

        if (!valid_blocknumbers) return false;

        // console.log(events.sensorAddressUpdatedEvents);

        const assigned_data = assign_data_for_verification(data, events)


        //iwo hier noch signatur prüfen
        const leafs = [];
        for(data_entry of assigned_data) {
            // console.log(data_entry)
            let temp_leaf = [data_entry.blocknumber, await generate_leaf(general, data_entry)]
            leafs.push(temp_leaf);

        }



        const merkle_root_from_blockchain = await read_merkle_root(contract)

        const merkle_tree = create_merkle_tree(leafs)
        const merkle_root_from_data = merkle_tree.root
        console.log("Merkle Root from data: " + merkle_root_from_data)

        if (merkle_root_from_blockchain == merkle_root_from_data) {
            return true;
        } else {
            return false;
        }

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


function create_merkle_tree (values) {
    leaf_type = ["uint256", "string"]
    return StandardMerkleTree.of(values, leaf_type);
}

module.exports = {
    verify_proof,
    data_from_website,
    graph_for_data,
    create_merkle_tree
}


// alles sortieren (daten von datenbank, hier und bei node_service???)