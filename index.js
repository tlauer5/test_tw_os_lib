const { createContract, readSensor, readMerkleRoot, readAllEvents } = require("./blockchain/blockchain")
require('dotenv').config();
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const DEFAULT_CONTRACT_ADDRESS = "0x96347d982759b643997A1813D14Db1F606aa9ad4"
const DEFAULT_ABI = require("./blockchain/abi/abi.json");
const { getAllData } = require("./data_fetcher/data_fetcher");
const { plotData } = require("./data_plotter/data_plotter");
const { checkBlockNumbers, assignDataForVerification } = require("./data_verifier/data_verifier");
const { generateLeaf } = require("./ipfs/ipfs");

const DEFAULT_DATA_API_URL = "http://127.0.0.1:8000/read-table"


const general = {
    baseIpfsUrl: "https://ipfs.io/ipfs/",
    temperatureUnit: "°C",
    humidityUnit: "%",
    chainId: 80001,
    contractAddress: "0x96347d982759b643997A1813D14Db1F606aa9ad4",
}

async function verifyProof (data, providerUrl, abi = DEFAULT_ABI, contractAddress = DEFAULT_CONTRACT_ADDRESS) {
    if (data && providerUrl) {
        const contract = createContract(providerUrl, abi, contractAddress)

        const events = await readAllEvents(contract)

        const validBlockNumbers = checkBlockNumbers(data, events.merkleRootRequestedEvents);

        if (!validBlockNumbers) return false;

        // console.log(events.sensorAddressUpdatedEvents);

        const assignedData = assignDataForVerification(data, events)


        //iwo hier noch signatur prüfen
        const leafs = [];
        for(dataEntry of assignedData) {
            // console.log(dataEntry)
            let tempLeaf = [dataEntry.blockNumber, await generateLeaf(general, dataEntry)]
            leafs.push(tempLeaf);

        }



        const merkleRootFromBlockchain = await readMerkleRoot(contract)

        const merkleTree = createMerkleTree(leafs)
        const merkleRootFromData = merkleTree.root
        console.log("Merkle Root from data: " + merkleRootFromData)

        if (merkleRootFromBlockchain == merkleRootFromData) {
            return true;
        } else {
            return false;
        }

    } else {
        console.log("Data or Provider URL is missing.");
        return false;
    }


}

async function dataFromWebsite (apiUrl = DEFAULT_DATA_API_URL) {
    return getAllData(apiUrl);
}

async function graphForData (data) {
    await plotData(data);
}


function createMerkleTree (values) {
    leafType = ["uint256", "string"]
    return StandardMerkleTree.of(values, leafType);
}

module.exports = {
    verifyProof,
    dataFromWebsite,
    graphForData,
    createMerkleTree
}


// alles sortieren (daten von datenbank, hier und bei node_service???)