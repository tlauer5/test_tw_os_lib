const { ethers } = require("ethers")

function createContract (providerUrl, abi, contractAddress) {

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    const contract = new ethers.Contract(contractAddress, abi, provider);

    return contract
}


async function readSensor (contract) {
    try {
        const result = await contract.sensor();
        console.log("Read sensor address: " + result + " from contract.\n");
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}


async function readMerkleRoot (contract) {
    try {
        result = await contract.merkleRoot();
        console.log("Read current merkle root: " + result + " from contract.\n");
        return result;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function readAllEvents (contract) {
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
    readSensor,
    readMerkleRoot,
    createContract,
    readAllEvents
};

