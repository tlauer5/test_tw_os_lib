const CID = require('cids');
const multihashing = require('multihashing-async');
const axios = require('axios');


// CID Inspector um CID auseinander zu nehmen. Wie ist CID aufgebaut. Dann kann man den Prozess reproduzieren.
// https://cid.ipfs.tech/
// Falls nötig: https://docs.ipfs.tech/concepts/content-addressing/#cid-conversion


async function generate_leaf(general, data) {
  const json_for_ipfs = await generate_json_for_ipfs(general, data)
  const cid = await create_cid(json_for_ipfs, data.cidDataFormat)
  // await storeBlobToIPFS(json_for_ipfs, apikey);

  return cid;
}

async function storeBlobToIPFS (blobData, apikey) {

  try {
    const response = await axios.post("https://api.nft.storage/upload", blobData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`
      }
    });

    const cid = response.data.value.cid;
    console.log('Blob stored successfully. CID:', cid);
  } catch (error) {
    console.error('Error storing Blob:', error);
  }
}


async function create_cid (data, cidDataFormat) {

  const algorithm = cidDataFormat.multihashAlgorithm; //"sha2-256"
  const version = get_cid_version(cidDataFormat.version); //1
  const multicodec = cidDataFormat.multicodec; //raw


  // Hash the data using SHA-256
  const hash = await multihashing(data, algorithm);

  // Create a CID using the hash
  const cid = new CID(version, multicodec, hash);

  // Convert the CID to its string representation
  const cidString = cid.toString()//cid.toBaseEncodedString('base32');

  return cidString
}


function get_cid_version(version) {
  return parseInt(version[version.length - 1], 10);
}

async function fetch_data_from_ipfs(base_ipfs_url, cid) {


  const ipfsUrl = `${base_ipfs_url}${cid}`;

    try {
      const response = await axios.get(ipfsUrl);
      let data = response.data;

      return data

    } catch (error) {
      console.error('Es gab ein Problem beim Abrufen der IPFS-Daten:', error.message);
  }

}


function fill_template_with_data (template, general, data) {

  template["block_number"] = data.blocknumber
  template["chain_id"] = general.chain_id
  template["contract_address"] = general.contract_address

  template["units"]["temperature"] = general.temperature_unit
  template["units"]["humidity"] = general.humidity_unit

  template["sensor_signature"]= data.signature

  template["sensor_data"]["temperature"] = data.temperature
  template["sensor_data"]["humidity"] = data.humidity

  return template
}


async function generate_json_for_ipfs (general, data) {
  const template = await fetch_data_from_ipfs(general.base_ipfs_url, data.cidDataFormat.dataTemplateCid);
  filled_template = fill_template_with_data(template, general, data);

  const formattedJson = JSON.stringify(filled_template, null, 2);

  const buffer = Buffer.from(formattedJson);
  return buffer;
}

module.exports = {
  createCID: create_cid,
  fetch_data_from_ipfs,
  fill_template_with_data,
  generate_json_for_ipfs,
  generate_leaf
};
