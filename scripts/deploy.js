const { ethers } = require("hardhat");
const { promises: fs } = require("fs");
const { join: joinPath } = require("path");

async function deploy(contractName, ...args) {
  try {
    const Contract = await ethers.getContractFactory(contractName);
    const deployedContact = await Contract.deploy(...args);
    await deployedContact.deployed();
    return deployedContact;
  } catch (error) {
    console.log({ contractName, args });
    throw error;
  }
}

function saveDeployedContact(contractName, { interface, address }) {
  return fs.writeFile(
    joinPath(process.cwd(), `deployed-contracts/${contractName}.ts`),
    `export default ${JSON.stringify({
      contractName,
      interface,
      address,
    })}`
  );
}

async function main() {
  const MASWhiteLists = await deploy("WhiteLists");

  await saveDeployedContact("MASWhiteLists", MASWhiteLists);

  const MAS = await deploy(
    "MAS",
    "Music Ark Station",
    "MAS",
    MASWhiteLists.address,
    ""
  );

  await saveDeployedContact("MAS", MAS);

  const MASRoyalty = await deploy(
    "royalty",
    MAS.address,
    MASWhiteLists.address
  );

  await saveDeployedContact("MASRoyalty", MASRoyalty);

  const MASBank = await deploy(
    "Bank",
    MAS.address,
    MASRoyalty.address,
    MASWhiteLists.address
  );

  await saveDeployedContact("MASBank", MASBank);

  const NFTSales = await deploy(
    "NFTSales",
    MAS.address,
    MASBank.address,
    MASWhiteLists.address
  );

  await saveDeployedContact("NFTSales", NFTSales);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
