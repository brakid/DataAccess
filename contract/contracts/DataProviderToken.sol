// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Owned.sol";

struct Entry {
  bool exists;
  uint index;
}

contract DataProviderToken is ERC20, Owned {
  uint256 private constant FEE = 5; // 5%
  uint256 private constant RECORDS_PER_DATA_ACCESS_TOKEN = 1000;

  IERC20 private immutable dataAccessToken;

  address[] private holders;
  mapping(address => Entry) holdersMap;
  mapping(address => uint256) private unclaimedBalances;
  uint256 private ownerUnclaimedBalance;

  mapping(bytes => bool) usedSignatures;
  address private immutable signer;

  event Provided(
    uint256 indexed timestamp,
    address indexed provider,
    uint256 recordCount
  );

  event Buy(
    uint256 indexed timestamp,
    address indexed buyer,
    uint256 recordCount
  );

  event RewardClaimed(
    uint256 indexed timestamp,
    address indexed claimer,
    uint256 amount
  );

  constructor(address dataAccessTokenAddress, address _signer) ERC20("DataProviderToken", "DPT") {
    dataAccessToken = IERC20(dataAccessTokenAddress);
    signer = _signer;
  }

  function decimals() public pure override returns (uint8) {
    return 0;
  }

  function provide(uint256 recordCount, uint256 timestamp, bytes memory signature) external {
    bool valid = validate(recordCount, timestamp, msg.sender, signature);
    
    require(valid, 'Signature not valid');
    require(!usedSignatures[signature], 'Signature already claimed');

    _mint(msg.sender, recordCount);

    usedSignatures[signature] = true;

    emit Provided(block.timestamp, msg.sender, recordCount);
  }

  function buy(uint256 recordCount) external {
    require(recordCount > 0, "Requests for positive number of records only");
    uint256 dataAccessTokenCount = 
        SafeMath.div(SafeMath.mul(recordCount, 10**18), RECORDS_PER_DATA_ACCESS_TOKEN);

    require(dataAccessToken.balanceOf(msg.sender) >= dataAccessTokenCount, "Balance not large enough");
    require(dataAccessToken.allowance(msg.sender, address(this)) >= dataAccessTokenCount, "Allowance not large enough");

    dataAccessToken.transferFrom(msg.sender, address(this), dataAccessTokenCount); //lock in contract

    uint256 rewardsToDistribute = 
      SafeMath.div(SafeMath.mul(dataAccessTokenCount, FEE), 100);
    
    uint256 rewardsDistributed = 0;

    for (uint256 index = 0; index < holders.length; index++) {
      address holder = holders[index];
      require(balanceOf(holder) > 0, "Holder array is not up to date");
      uint256 balance = balanceOf(holder);
      uint256 rewardClaim =
        SafeMath.div(SafeMath.mul(rewardsToDistribute, balance), totalSupply());
      unclaimedBalances[holder] += rewardClaim;
      rewardsDistributed += rewardClaim;
    }

    ownerUnclaimedBalance += SafeMath.sub(dataAccessTokenCount, rewardsDistributed);

    emit Buy(block.timestamp, msg.sender, recordCount);
  }

  function claim() external {
    require(unclaimedBalances[msg.sender] > 0, "No unclaimed rent");
    uint256 claimAmount = unclaimedBalances[msg.sender];
    unclaimedBalances[msg.sender] = 0;
    dataAccessToken.transfer(msg.sender, claimAmount);

    emit RewardClaimed(block.timestamp, msg.sender, claimAmount);
  }

  function claimOwner() external onlyAdmin {
    dataAccessToken.transfer(admin, ownerUnclaimedBalance);

    emit RewardClaimed(block.timestamp, msg.sender, ownerUnclaimedBalance);

    ownerUnclaimedBalance = 0;
  }

  function showUnclaimed() external view returns (uint256) {
    return unclaimedBalances[msg.sender];
  }

  function showUnclaimedOwner() external view onlyAdmin returns (uint256) {
    return ownerUnclaimedBalance;
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
    if (balanceOf(from) == amount && from != address(0)) {
      // not minting and sender has no balance left afterwards
      bool foundTo = holdersMap[from].exists;
      require(foundTo, "Expecting holder to be present");

      deleteHolder(from);
    }

    if (to != address(0)) {
      // not burning
      bool foundTo = holdersMap[to].exists;
      if (!foundTo) {
        insertHolder(to);
      }
    }
  }

  function insertHolder(address holder) internal {
    holders.push(holder);
    holdersMap[holder].exists = true;
    holdersMap[holder].index = holders.length - 1;
  }

  function deleteHolder(address holderToDelete) internal {
    uint indexToDelete = holdersMap[holderToDelete].index;  

    if (indexToDelete != holders.length - 1) {
      address lastHolder = holders[holders.length - 1];
      require(lastHolder != address(0), "Expecting holder not to be the null address");
      holders[indexToDelete] = lastHolder;
      holdersMap[lastHolder].index = indexToDelete;
    }
    holders.pop();
    delete holdersMap[holderToDelete];
  }

  function validate(uint256 recordCount, uint256 timestamp, address sender, bytes memory signature) internal view returns (bool) {
    bytes32 messageHash = getMessageHash(recordCount, timestamp, sender);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

    return recoverSigner(ethSignedMessageHash, signature) == signer;
  }

  function getMessageHash(uint256 recordCount, uint256 timestamp, address sender) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(recordCount, timestamp, sender));
  }

  function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
  }

  function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

    return ecrecover(ethSignedMessageHash, v, r, s);
  }

  function splitSignature(bytes memory signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(signature.length == 65, "Invalid signature length");

    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := and(mload(add(signature, 65)), 255)
    }
    if (v < 27) v += 27;
  }
}