// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DataAccessToken is ERC20 {
  IERC20 public immutable usdc;
  uint private constant CONVERSION_FACTOR = 1; // 1 USDC = 1 DataAccessToken, price: 1 token per 1000 records
  uint private constant USDC_DECIMALS = 10**6;

  event Mint (
    uint256 indexed timestamp,
    address indexed targetAddress,
    uint256 usdcAmount,
    uint256 dataAccessTokenCount
  );

  event Burn (
    uint256 indexed timestamp,
    address indexed targetAddress,
    uint256 usdcAmount,
    uint256 dataAccessTokenCount
  );

  constructor(address usdcAddress) ERC20('Data Access Token', 'DAT') {
    usdc = IERC20(usdcAddress);
  }

  function mint(uint dataAccessTokenCount) external {
    require(dataAccessTokenCount > 0, 'Positive token requests only');
    uint usdcAmount = convertToUsdc(dataAccessTokenCount);
    require(usdcAmount <= SafeMath.mul(1000, USDC_DECIMALS), 'At most 1000 USDC can be exchanged');
    usdc.transferFrom(msg.sender, address(this), usdcAmount); // lock USDC in this contract
    _mint(msg.sender, dataAccessTokenCount);
    emit Mint(block.timestamp, msg.sender, usdcAmount, dataAccessTokenCount);
  }

  function burn(uint dataAccessTokenCount) external {
    require(dataAccessTokenCount > 0, 'Positive token withdrawals only');
    _burn(msg.sender, dataAccessTokenCount);
    uint usdcAmount = convertToUsdc(dataAccessTokenCount);
    usdc.transfer(msg.sender, usdcAmount);
    emit Burn(block.timestamp, msg.sender, usdcAmount, dataAccessTokenCount);
  }

  function convertToUsdc(uint dataAccessTokenCount) internal pure returns (uint256) {
    // dataAccessTokenCount (in x * 10^18) * factor / 10^6
    return 
        SafeMath.div(
          SafeMath.mul(dataAccessTokenCount, CONVERSION_FACTOR), 
          USDC_DECIMALS);
  }
}