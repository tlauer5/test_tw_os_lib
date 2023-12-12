function check_blocknumbers(data, merkleRootRequestedEvents) {

    // Es ist nur interessant ob die Daten die zurückgegeben werden auch verifiziert werden könnne, alles davor im Smart Contract ist uninteressant

    // hier testen wir ob es irgend eine Blocknumber gibt die es gar nicht geben darf - jede block number
    // in der Datenbank muss mal requested worden sein

    // Extract Blocknumbers from Database into seperate list
    database_blocknumbers = [];
    for (entry of data) {
        database_blocknumbers.push(entry[0]);
    }

    // Check if there is any blocknumber in database which should not be there because it was never requested (MerkleRootRequested Event)
    for (blocknumberToCheck of database_blocknumbers) {

        if (!merkleRootRequestedEvents.some(e => e.blockNumber == blocknumberToCheck)){
            console.log(blocknumberToCheck + " is missing in MerkleRootRequested Events.")
            return false;
        }
    }

    return true

}

// function find_first_matching_blocknumber_testing(data, merkleRootRequestedEvents) {

//     for (i = 0; int)

// }

module.exports = {
    check_blocknumbers
};