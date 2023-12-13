const CID = require('cids');
const multihashing = require('multihashing-async');
const axios = require('axios');


// CID Inspector um CID auseinander zu nehmen. Wie ist CID aufgebaut. Dann kann man den Prozess reproduzieren.
// https://cid.ipfs.tech/
// Falls nötig: https://docs.ipfs.tech/concepts/content-addressing/#cid-conversion


async function generateLeaf(general, data) {
  const jsonForIpfs = await generateJsonForIpfs(general, data)
  const cid = await createCid(jsonForIpfs, data.cidDataFormat)
  return cid;
}

async function storeBlobToIPFS (blobData, apiKey) {

  try {
    const response = await axios.post("https://api.nft.storage/upload", blobData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const cid = response.data.value.cid;
    console.log('Blob stored successfully. CID:', cid);
  } catch (error) {
    console.error('Error storing Blob:', error);
  }
}


async function createCid (data, cidDataFormat) {

  const algorithm = cidDataFormat.multihashAlgorithm; //"sha2-256"
  const version = getCidVersion(cidDataFormat.version); //1
  const multicodec = cidDataFormat.multicodec; //raw


  // Hash the data using SHA-256
  const hash = await multihashing(data, algorithm);

  // Create a CID using the hash
  const cid = new CID(version, multicodec, hash);

  // Convert the CID to its string representation
  const cidString = cid.toString()//cid.toBaseEncodedString('base32');

  return cidString
}


function getCidVersion(version) {
  return parseInt(version[version.length - 1], 10);
}

async function fetchDataFromIpfs(baseIpfsUrl, cid) {


  const ipfsUrl = `${baseIpfsUrl}${cid}`;

    try {
      const response = await axios.get(ipfsUrl);
      let data = response.data;

      return data

    } catch (error) {
      console.error('Es gab ein Problem beim Abrufen der IPFS-Daten:', error.message);
  }

}


function fillTemplateWithData (template, general, data) {

  template["blockNumber"] = data.blockNumber
  template["chainId"] = general.chainId
  template["contractAddress"] = general.contractAddress

  template["units"]["temperature"] = general.temperatureUnit
  template["units"]["humidity"] = general.humidityUnit

  template["sensorSignature"]= data.signature

  template["sensorData"]["temperature"] = data.temperature
  template["sensorData"]["humidity"] = data.humidity

  return template
}


async function generateJsonForIpfs (general, data) {
  const template = await fetchDataFromIpfs(general.baseIpfsUrl, data.cidDataFormat.dataTemplateCid);
  filledTemplate = fillTemplateWithData(template, general, data);

  const formattedJson = JSON.stringify(filledTemplate, null, 2);

  const buffer = Buffer.from(formattedJson);
  return buffer;
}

module.exports = {
  createCid,
  fetchDataFromIpfs,
  fillTemplateWithData,
  generateJsonForIpfs,
  generateLeaf,
  storeBlobToIPFS
};
