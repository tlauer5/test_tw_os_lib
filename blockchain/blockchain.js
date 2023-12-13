const { ethers } = require("ethers")

function create_contract (provider_url, abi, contract_address) {

    const provider = new ethers.providers.JsonRpcProvider(provider_url);

    const contract = new ethers.Contract(contract_address, abi, provider);

    return contract
}


async function read_sensor (contract) {
    try {
        const result = await contract.sensor();
        console.log("Read sensor address: " + result + " from contract.\n");
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}


async function read_merkle_root (contract) {
    try {
        result = await contract.merkleRoot();
        console.log("Read current merkle root: " + result + " from contract.\n");
        return result;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function read_all_events (contract) {
    const fromBlock = 0;
    const toBlock = 'latest';
    const events = await contract.queryFilter({}, fromBlock, toBlock);

    merkleRootUpdatedEvents = new Map();
    cidDataFormatUpdatedEvents = new Map();
    sensorAddressUpdatedEvents = new Map();
    merkleRootRequestedEvents = []
    for (e of events) {
        // console.log(e.event)
        if (e.event == "MerkleRootUpdated") {

            merkleRootUpdatedEvents.set(
                parseInt(e.args[0]._hex, 16),
                {
                    leaf: e.args[2],
                    merkleRoot: e.args[1]
                });

        } else if (e.event == "CidDataFormatUpdated") {

            cidDataFormatUpdatedEvents.set(
                parseInt(e.args[0]._hex, 16),
                {
                    multibase: e.args[1],
                    version: e.args[2],
                    multicodec: e.args[3],
                    multihashAlgorithm: e.args[4],
                    multihashLength: e.args[5],
                    dataTemplateCid: e.args[6]
                })

        } else if (e.event == "sensorAddressUpdated") {
            sensorAddressUpdatedEvents.set(
                parseInt(e.args[0]._hex, 16),
                e.args[1]
                )

        } else if (e.event == "MerkleRootRequested") {
            merkleRootRequestedEvents.push(parseInt(e.args[0]._hex, 16))
        }
    }

    return {
        merkleRootRequestedEvents: merkleRootRequestedEvents,
        merkleRootUpdatedEvents: merkleRootUpdatedEvents,
        sensorAddressUpdatedEvents: sensorAddressUpdatedEvents,
        cidDataFormatUpdatedEvents: cidDataFormatUpdatedEvents
    }
}




module.exports = {
    read_sensor,
    read_merkle_root,
    create_contract,
    read_all_events
};

