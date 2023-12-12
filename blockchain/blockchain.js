const { ethers } = require("ethers")

function create_contract(provider_url, abi, contract_address) {

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

async function read_cid_data_format (contract) {
    try {
        const result = await contract.getCurrenCidDataFormat();
        console.log("Read cidDataFormat: " + result + " from contract.\n");
        return {
            multibase: result.multibase,
            version: result.version,
            multicodec: result.multicodec,
            multihashAlgorithm: result.multihashAlgorithm,
            multihashLength: result.multihashLength,
            dataTemplateCid: result.dataTemplateCid
        }
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

async function read_all_events(contract) {
    const fromBlock = 0;
    const toBlock = 'latest';
    const events = await contract.queryFilter({}, fromBlock, toBlock);

    merkleRootUpdatedEvents = []
    cidDataFormatUpdatedEvents = []
    merkleRootRequestedEvents = []
    for (e of events) {
        // console.log(e.event)
        if (e.event == "MerkleRootUpdated") {

            merkleRootUpdatedEvents.push({
                blockNumber: parseInt(e.args[0]._hex, 16),
                leaf: e.args[2],
                merkleRoot: e.args[1]
            })

        } else if (e.event == "CidDataFormatUpdated") {

            cidDataFormatUpdatedEvents.push({
                blockNumber: parseInt(e.args[0]._hex, 16),
                multibase: e.args[1],
                version: e.args[2],
                multicodec: e.args[3],
                multihashAlgorithm: e.args[4],
                multihashLength: e.args[5],
                dataTemplateCid: e.args[6]
            })

        } else if (e.event == "MerkleRootRequested") {
            merkleRootRequestedEvents.push({
                blockNumber: parseInt(e.args[0]._hex, 16)
            })


        }
    }// mit neuem Contract dann auch noch nach sensor address events abfragen

    return {
        merkleRootRequestedEvents: merkleRootRequestedEvents,
        merkleRootUpdatedEvents: merkleRootUpdatedEvents,
        cidDataFormatUpdatedEvents: cidDataFormatUpdatedEvents
    }
}




module.exports = {
    read_sensor,
    read_cid_data_format,
    read_merkle_root,
    create_contract,
    read_all_events
};

