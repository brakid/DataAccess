const UsdcMock = artifacts.require('UsdcMock.sol');
const DataAccessToken = artifacts.require('DataAccessToken.sol');
const DataProviderToken = artifacts.require('DataProviderToken.sol');

module.exports = async (deployer, network, addresses) => {
  const [ signer, owner ] = addresses;

  const randomSeed = Math.round(Math.random() * 1000000);

  if (network === 'development' || network == 'develop') {
    await deployer.deploy(UsdcMock);
    const usdcMock = await UsdcMock.deployed();

    await deployer.deploy(DataAccessToken, usdcMock.address);
    const dataAccessToken = await DataAccessToken.deployed();
    
    await deployer.deploy(DataProviderToken, dataAccessToken.address, signer, { from: owner });
    const dataProviderToken = await DataProviderToken.deployed();
  }
};