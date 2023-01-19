async function main() {
  const greeterContract = await ethers.getContractFactory("Greeter");

  // here we deploy the contract
  // we provide also constructor args
  const deployedGreeterContract = await greeterContract.deploy(
    "Set by the constructor"
  );
  await deployedGreeterContract.deployed();

  // print the address of the deployed contract
  console.log("Greeter Contract Address:", deployedGreeterContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
