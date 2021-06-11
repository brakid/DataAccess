const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const [ signerAddress, senderAddress, otherAddress ] = accounts;
const { BN, expectEvent, constants, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const UsdcMock = contract.fromArtifact('UsdcMock');
const DataAccessToken = contract.fromArtifact('DataAccessToken');
const DataProviderToken = contract.fromArtifact('DataProviderToken');

describe('DataProviderToken', async () => {
  let usdcMock;
  let dataAccessToken;
  let dataProviderToken;
  beforeEach(async () => {
    usdcMock = await UsdcMock.new();
    dataAccessToken = await DataAccessToken.new(usdcMock.address);
    dataProviderToken = await DataProviderToken.new(dataAccessToken.address, signerAddress);
  });

  it('should reject invalid signature (wrong passed value)', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    await expectRevert(dataProviderToken.provide(1, 101, signature, { from: senderAddress }), 'Signature not valid');
    await expectRevert(dataProviderToken.provide(2, 100, signature, { from: senderAddress }), 'Signature not valid');
    await expectRevert(dataProviderToken.provide(1, 100, signature, { from: otherAddress }), 'Signature not valid');
  });

  it('should reject invalid signature (wrong length)', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    await expectRevert(dataProviderToken.provide(1, 100, signature + 'a', { from: senderAddress }), 'Invalid signature length');
  });

  it('should reject invalid signer', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, otherAddress);
    const signature = await web3.eth.sign(hash, senderAddress);
    
    await expectRevert(dataProviderToken.provide(1, 100, signature, { from: senderAddress }), 'Signature not valid');
  });
});