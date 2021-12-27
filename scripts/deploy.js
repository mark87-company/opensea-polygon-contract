const { ethers } = require("hardhat");
const { promises: fs } = require("fs");
const { join: joinPath } = require("path");

async function deploy(contractName, ...args) {
  const Contract = await ethers.getContractFactory(contractName);
  const deployedContact = await Contract.deploy(...args);
  await deployedContact.deployed();
  return deployedContact;
}

function saveDeployedContact(contractName, { interface, address }) {
  return fs.writeFile(
    joinPath(process.cwd(), `deployed-contracts/${contractName}.json`),
    JSON.stringify({
      contractName,
      interface,
      address,
    })
  );
}

async function main() {
  const MASWhiteLists = await deploy("registryAddress");

  await saveDeployedContact("MASWhiteLists", MASWhiteLists);

  const MAS = await deploy(
    "MAS",
    "Music Ark Station",
    "MAS",
    MASWhiteLists.address,
    ""
  );

  await saveDeployedContact("MAS", MAS);

  const MASRoyalty = await deploy("royalty", MAS.address);

  await saveDeployedContact("MASRoyalty", MASRoyalty);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
