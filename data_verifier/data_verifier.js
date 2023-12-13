
function check_blocknumbers(data, merkleRootRequestedEvents) {

    // Es ist nur interessant ob die Daten die zurückgegeben werden auch verifiziert werden könnne, alles davor im Smart Contract ist uninteressant

    // hier testen wir ob es irgend eine Blocknumber gibt die es gar nicht geben darf - jede block number
    // in der Datenbank muss mal requested worden sein

    // Extract Blocknumbers from Database into seperate list
    database_blocknumbers = [];
    for (entry of data) {
        database_blocknumbers.push(entry[0]);
    }

    return database_blocknumbers.every(blockNumber => merkleRootRequestedEvents.includes(blockNumber));
}

function remove_irrelevant_blocknumbers(blocknumbers, target_number) {

    let position = -1;

    // Durchlaufe die Liste, um die Position der größten Zahl zu finden, die kleiner oder gleich der Zielzahl ist
    for (let i = 0; i < blocknumbers.length; i++) {
        if (blocknumbers[i] < target_number) {
            position = i;
        } else {
            break;
        }
    }
    return blocknumbers.slice(position);
}



function assign_data_for_verification(data, events) {
    let blocknums_cidDataFormat = [...events.cidDataFormatUpdatedEvents.keys()];
    let blocknums_sensor = [...events.sensorAddressUpdatedEvents.keys()];

    blocknums_cidDataFormat.sort((a, b) => a - b);
    blocknums_sensor.sort((a, b) => a - b);

    first_blockNumber_in_data = data[0][0]
    blocknums_cidDataFormat = remove_irrelevant_blocknumbers(blocknums_cidDataFormat, first_blockNumber_in_data)
    blocknums_sensor = remove_irrelevant_blocknumbers(blocknums_sensor, first_blockNumber_in_data)

    const assigned_data = [];
    for (data_entry of data) {
        let current_blocknumber = data_entry[0];

        if( current_blocknumber > blocknums_cidDataFormat[1]) {
            blocknums_cidDataFormat.shift()
        }

        if (current_blocknumber > blocknums_sensor[1]) {
            blocknums_sensor.shift();
        }

        let temp_object = {
            "blocknumber": current_blocknumber,
            "temperature": data_entry[1],
            "humidity": data_entry[2],
            "signature": data_entry[3],
            "cidDataFormat": events.cidDataFormatUpdatedEvents.get(blocknums_cidDataFormat[0]),
            "sensor": events.sensorAddressUpdatedEvents.get(blocknums_sensor[0])
        };

        assigned_data.push(temp_object)
    }

    return assigned_data;

}

async function generate_merkle_tree(leafs) {

}


function check_order_of_blocknumbers(data, merkleRootRequestedEvents, merkleRootUpdatedEvents) {

}

module.exports = {
    check_blocknumbers,
    assign_data_for_verification,
    generate_merkle_tree
};