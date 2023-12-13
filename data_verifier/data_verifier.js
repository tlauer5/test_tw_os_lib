const Web3 = require('web3');

function checkBlockNumbers(data, merkleRootRequestedEvents) {

    // Es ist nur interessant ob die Daten die zurückgegeben werden auch verifiziert werden könnne, alles davor im Smart Contract ist uninteressant

    // hier testen wir ob es irgend eine Blocknumber gibt die es gar nicht geben darf - jede block number
    // in der Datenbank muss mal requested worden sein

    // Extract Blocknumbers from Database into seperate list
    databaseBlockNumbers = [];
    for (entry of data) {
        databaseBlockNumbers.push(entry[0]);
    }

    return databaseBlockNumbers.every(blockNumber => merkleRootRequestedEvents.includes(blockNumber));
}

function removeIrrelevantBlockNumbers(blockNumbers, targetNumber) {

    let position = -1;

    // Durchlaufe die Liste, um die Position der größten Zahl zu finden, die kleiner oder gleich der Zielzahl ist
    for (let i = 0; i < blockNumbers.length; i++) {
        if (blockNumbers[i] < targetNumber) {
            position = i;
        } else {
            break;
        }
    }
    return blockNumbers.slice(position);
}



function assignDataForVerification(data, events) {
    let blockNumsCidDataFormat = [...events.cidDataFormatUpdatedEvents.keys()];
    let blockNumsSensor = [...events.sensorAddressUpdatedEvents.keys()];

    blockNumsCidDataFormat.sort((a, b) => a - b);
    blockNumsSensor.sort((a, b) => a - b);

    firstBlockNumberInData = data[0][0]
    blockNumsCidDataFormat = removeIrrelevantBlockNumbers(blockNumsCidDataFormat, firstBlockNumberInData)
    blockNumsSensor = removeIrrelevantBlockNumbers(blockNumsSensor, firstBlockNumberInData)

    const assignedData = [];
    for (dataEntry of data) {
        let currentBlockNumber = dataEntry[0];

        if( currentBlockNumber > blockNumsCidDataFormat[1]) {
            blockNumsCidDataFormat.shift()
        }

        if (currentBlockNumber > blockNumsSensor[1]) {
            blockNumsSensor.shift();
        }

        let tempObject = {
            "blockNumber": currentBlockNumber,
            "temperature": dataEntry[1],
            "humidity": dataEntry[2],
            "signature": dataEntry[3],
            "cidDataFormat": events.cidDataFormatUpdatedEvents.get(blockNumsCidDataFormat[0]),
            "sensor": events.sensorAddressUpdatedEvents.get(blockNumsSensor[0])
        };

        assignedData.push(tempObject)
    }

    return assignedData;

}


async function recoverAddressFromData(data) {
    var reconstructed_message = data.blockNumber + "," + data.temperature + "," + data.humidity //create_message(data);
    const address = Web3.eth.accounts.recover(reconstructed_message, data.signature)
    return address
}


function checkOrderOfBlockNumbers(data, merkleRootRequestedEvents, merkleRootUpdatedEvents) {

}

module.exports = {
    checkBlockNumbers,
    assignDataForVerification,
    recoverAddressFromData,
};