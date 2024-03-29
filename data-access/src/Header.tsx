import React, { useContext, useEffect, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { EthereumContext, LogContext } from './App';
import { Contracts, EthereumData, LogData } from './utils/types';
import { ethers } from 'ethers';

const Header = () => {
  const { address, block, data: contracts }  = useContext<EthereumData<Contracts>>(EthereumContext);
  const { setError, setConfirmation }  = useContext<LogData>(LogContext);
  const [ usdcBalance, setUsdcBalance ] = useState<BigNumber>(BigNumber.from(0));
  const [ usdcDecimals, setUsdcDecimals ] = useState<number>(6);
  const [ dataAccessTokenBalance, setDataAccessTokenBalance ] = useState<BigNumber>(BigNumber.from(0));
  const [ dataAccessTokenDecimals, setDataAccessTokenDecimals ] = useState<number>(18);
  const [ dataProviderTokenBalance, setDataProviderTokenBalance ] = useState<BigNumber>(BigNumber.from(0));
  const [ dataAccessTokenClaims, setDataAccessTokenClaims ] = useState<BigNumber>(BigNumber.from(0));

  useEffect(() => {
    const getBalances = async () => {
      if (address && contracts) {
        setUsdcBalance(await contracts.usdc.balanceOf(address));
        setUsdcDecimals(await contracts.usdc.decimals());
        setDataAccessTokenBalance(await contracts.dataAccessToken.balanceOf(address));
        setDataAccessTokenDecimals(await contracts.dataAccessToken.decimals());
        setDataProviderTokenBalance(await contracts.dataProviderToken.balanceOf(address));
        setDataAccessTokenClaims(await contracts.dataProviderToken.showUnclaimed());
      }
    };

    getBalances();
  }, [ block, contracts, address ]);

  const handleError = async (call: () => Promise<void>) => {
    try {
      setError('');
      setConfirmation('');
      await call()
    } catch (e) {
      setError(JSON.stringify(e));
    }
  }

  const claimEarnings = async () => {
    const claimTransaction = await contracts?.dataProviderToken.claim();
    await claimTransaction.wait();
    setConfirmation('Successfully claimed earnings');
  }

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark pb-2'>
      <div className='container justify-content-md-center'>
        <div className='col-lg-3 text-md-left text-center mb-lg-0 mb-md-3'>
          <a className='navbar-brand h1' href='#'><i className='fas fa-coins'></i>&nbsp;&nbsp;Data Access</a>
        </div>
        <div className='text-light col-lg-9'>
          <div className='row'>
            <div className='col-md-6 pl-0'>
              <div className='col-12'><i className='fas fa-wallet'></i> Wallet address:</div>
              <div className='col-12'><span data-toggle='tooltip' data-placement='top' data-original-title={ address }>{ address?.substr(0, 25) }...</span></div>
            </div>
            <div className='col-md-6 pl-0'>
              <div className='col-12'><i className='fas fa-comment-dollar'></i> USDC Balance: { ethers.utils.formatUnits(usdcBalance, usdcDecimals) } USDC</div>
              <div className='col-12'><i className='fas fa-lock-open'></i> DataAccessTokens: { ethers.utils.formatUnits(dataAccessTokenBalance, dataAccessTokenDecimals) }</div>
              <div className='col-12'><i className='fas fa-list-alt'></i> DataProviderTokens: { dataProviderTokenBalance.toString() }</div>
              <div className='col-12'><i className='fas fa-exclamation-circle'></i> { ethers.utils.formatUnits(dataAccessTokenClaims, dataAccessTokenDecimals) } claimable <button className='btn btn-primary' onClick={ (e) => handleError(claimEarnings) } disabled={ dataAccessTokenClaims.isZero() } >Claim Earnings</button></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;