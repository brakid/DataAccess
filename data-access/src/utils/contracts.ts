import { ethers } from 'ethers';
import { NETWORK, USDC_ADDRESS } from './externals';
import * as erc20 from '../abis/ERC20.json';
import { Contracts } from './types';

export const getContracts = (web3Provider: ethers.providers.Web3Provider): Contracts => {
  const signer = web3Provider.getSigner();

  return {
    usdc: new ethers.Contract(
      USDC_ADDRESS,
      erc20.abi,
      signer
    ),
  };
};