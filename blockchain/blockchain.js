const { ethers } = require("ethers")

function createContract(provider_url, abi, contract_address) {

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




module.exports = {
    read_sensor,
    read_cid_data_format,
    read_merkle_root,
    createContract
};

