const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const [ signerAddress, senderAddress, otherAddress, buyerAddress ] = accounts;
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
    
    await expectRevert(dataProviderToken.provide(1, 100, signature, { from: otherAddress }), 'Signature not valid');
  });

  it('should mint on valid signature', async () => {
    const hash = await web3.utils.soliditySha3(100, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    const receipt = await dataProviderToken.provide(100, 100, signature, { from: senderAddress });

    expectEvent(receipt, 'Provided', {
      provider: senderAddress,
      recordCount: new BN(100),
    });
    
    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(100));
  });

  it('should reject on already used signature on valid signature', async () => {
    const hash = await web3.utils.soliditySha3(101, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    const receipt = await dataProviderToken.provide(101, 100, signature, { from: senderAddress });

    expectEvent(receipt, 'Provided', {
      provider: senderAddress,
      recordCount: new BN(101),
    });
    
    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(101));

    await expectRevert(dataProviderToken.provide(101, 100, signature, { from: senderAddress }), 'Signature already claimed');

    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(101));
  });

  it('should accept buying and distribute earnings (large)', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    const receipt = await dataProviderToken.provide(1, 100, signature, { from: senderAddress });

    expectEvent(receipt, 'Provided', {
      provider: senderAddress,
      recordCount: new BN(1),
    });
    
    const hash2 = await web3.utils.soliditySha3(1, 100, otherAddress);
    const signature2 = await web3.eth.sign(hash2, signerAddress);
    
    const receipt2 = await dataProviderToken.provide(1, 100, signature2, { from: otherAddress });

    expectEvent(receipt2, 'Provided', {
      provider: otherAddress,
      recordCount: new BN(1),
    });
    
    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(1));
    expect(await dataProviderToken.balanceOf(otherAddress)).to.be.bignumber.equal(new BN(1));

    await usdcMock.faucet(buyerAddress, new BN(100*10**6));
    await usdcMock.increaseAllowance(dataAccessToken.address, new BN(100*10**6), { from: buyerAddress });
    await dataAccessToken.mint(web3.utils.toWei(new BN(100)), { from: buyerAddress });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(web3.utils.toWei(new BN(100)));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(new BN(0));
    expect(await usdcMock.balanceOf(buyerAddress)).to.be.bignumber.equal(new BN(0));

    await dataAccessToken.increaseAllowance(dataProviderToken.address, web3.utils.toWei(new BN(100)), { from: buyerAddress });
    
    const buyReceipt = await dataProviderToken.buy(100000, { from: buyerAddress }); // cost = 100 DataAccessToken

    expectEvent(buyReceipt, 'Buy', {
      buyer: buyerAddress,
      recordCount: new BN(100000),
    });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(web3.utils.toWei(new BN(0)));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(web3.utils.toWei(new BN(100)));

    expect(await dataProviderToken.showUnclaimed({ from: senderAddress })).to.be.bignumber.equal(new BN('47500000000000000000'));
    expect(await dataProviderToken.showUnclaimed({ from: otherAddress })).to.be.bignumber.equal(new BN('47500000000000000000'));
    expect(await dataProviderToken.showUnclaimedOwner()).to.be.bignumber.equal(web3.utils.toWei(new BN(5)));
  });

  it('should accept buying and distribute earnings (medium)', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    const receipt = await dataProviderToken.provide(1, 100, signature, { from: senderAddress });

    expectEvent(receipt, 'Provided', {
      provider: senderAddress,
      recordCount: new BN(1),
    });
    
    const hash2 = await web3.utils.soliditySha3(1, 100, otherAddress);
    const signature2 = await web3.eth.sign(hash2, signerAddress);
    
    const receipt2 = await dataProviderToken.provide(1, 100, signature2, { from: otherAddress });

    expectEvent(receipt2, 'Provided', {
      provider: otherAddress,
      recordCount: new BN(1),
    });
    
    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(1));
    expect(await dataProviderToken.balanceOf(otherAddress)).to.be.bignumber.equal(new BN(1));

    await usdcMock.faucet(buyerAddress, new BN(100*10**6));
    await usdcMock.increaseAllowance(dataAccessToken.address, new BN(100*10**6), { from: buyerAddress });
    await dataAccessToken.mint(web3.utils.toWei(new BN(100)), { from: buyerAddress });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(web3.utils.toWei(new BN(100)));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(new BN(0));
    expect(await usdcMock.balanceOf(buyerAddress)).to.be.bignumber.equal(new BN(0));

    await dataAccessToken.increaseAllowance(dataProviderToken.address, web3.utils.toWei(new BN(1)), { from: buyerAddress });
    
    const buyReceipt = await dataProviderToken.buy(1000, { from: buyerAddress }); // cost = 1 DataAccessToken

    expectEvent(buyReceipt, 'Buy', {
      buyer: buyerAddress,
      recordCount: new BN(1000),
    });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(web3.utils.toWei(new BN(99)));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(web3.utils.toWei(new BN(1)));

    expect(await dataProviderToken.showUnclaimed({ from: senderAddress })).to.be.bignumber.equal(new BN('475000000000000000'));
    expect(await dataProviderToken.showUnclaimed({ from: otherAddress })).to.be.bignumber.equal(new BN('475000000000000000'));
    expect(await dataProviderToken.showUnclaimedOwner()).to.be.bignumber.equal(new BN('50000000000000000'));
  });

  it('should accept buying and distribute earnings (small)', async () => {
    const hash = await web3.utils.soliditySha3(1, 100, senderAddress);
    const signature = await web3.eth.sign(hash, signerAddress);
    
    const receipt = await dataProviderToken.provide(1, 100, signature, { from: senderAddress });

    expectEvent(receipt, 'Provided', {
      provider: senderAddress,
      recordCount: new BN(1),
    });
    
    const hash2 = await web3.utils.soliditySha3(1, 100, otherAddress);
    const signature2 = await web3.eth.sign(hash2, signerAddress);
    
    const receipt2 = await dataProviderToken.provide(1, 100, signature2, { from: otherAddress });

    expectEvent(receipt2, 'Provided', {
      provider: otherAddress,
      recordCount: new BN(1),
    });
    
    expect(await dataProviderToken.balanceOf(senderAddress)).to.be.bignumber.equal(new BN(1));
    expect(await dataProviderToken.balanceOf(otherAddress)).to.be.bignumber.equal(new BN(1));

    await usdcMock.faucet(buyerAddress, new BN(100*10**6));
    await usdcMock.increaseAllowance(dataAccessToken.address, new BN(100*10**6), { from: buyerAddress });
    await dataAccessToken.mint(web3.utils.toWei(new BN(100)), { from: buyerAddress });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(web3.utils.toWei(new BN(100)));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(new BN(0));
    expect(await usdcMock.balanceOf(buyerAddress)).to.be.bignumber.equal(new BN(0));

    await dataAccessToken.increaseAllowance(dataProviderToken.address, web3.utils.toWei(new BN(1)), { from: buyerAddress });
    
    const buyReceipt = await dataProviderToken.buy(1, { from: buyerAddress }); // cost = 0.001 DataAccessToken

    expectEvent(buyReceipt, 'Buy', {
      buyer: buyerAddress,
      recordCount: new BN(1),
    });

    expect(await dataAccessToken.balanceOf(buyerAddress)).to.be.bignumber.equal(new BN('99999000000000000000'));
    expect(await dataAccessToken.balanceOf(dataProviderToken.address)).to.be.bignumber.equal(new BN('1000000000000000'));

    expect(await dataProviderToken.showUnclaimed({ from: senderAddress })).to.be.bignumber.equal(new BN('475000000000000'));
    expect(await dataProviderToken.showUnclaimed({ from: otherAddress })).to.be.bignumber.equal(new BN('475000000000000'));
    expect(await dataProviderToken.showUnclaimedOwner()).to.be.bignumber.equal(new BN('50000000000000'));
  });
});