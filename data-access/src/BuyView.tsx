import React, { useContext, useState } from 'react';
import { LARGE_ALLOWANCE } from './utils/helpers';
import { utils } from 'ethers';
import { EthereumData, Contracts, LogData, Record } from './utils/types';
import { buyData, recordCountAvailable } from './utils/service';
import { EthereumContext, LogContext } from './App';

const BuyView = () => {
  const { address, data: contracts }  = useContext<EthereumData<Contracts>>(EthereumContext);
  const { setError, setConfirmation }  = useContext<LogData>(LogContext);
  const [ records, setRecords ] = useState<Record[]>([]);

  const handleError = async (call: () => Promise<void>) => {
    try {
      setError('');
      setConfirmation('');
      await call()
    } catch (e) {
      setError(JSON.stringify(e));
    }
  }

  const buyTokens = async () => {
    const usdcAllowance = await contracts?.usdc.allowance(address, contracts.dataAccessToken.address);
    if (usdcAllowance < 1) {
      await contracts?.usdc.increaseAllowance(contracts.dataAccessToken.address, LARGE_ALLOWANCE);
    }

    const buyTransaction = await contracts?.dataAccessToken.mint(utils.parseUnits("100", 18));
    await buyTransaction.wait();
    setConfirmation('Buying access tokens successful');
  }

  const buyRecords = async () => {
    const dataAccessTokenAllowance = await contracts?.dataAccessToken.allowance(address, contracts.dataProviderToken.address);
    if (dataAccessTokenAllowance < 1) { 
      await contracts?.dataAccessToken.increaseAllowance(contracts.dataProviderToken.address, LARGE_ALLOWANCE);
    }

    const recordCount = await recordCountAvailable();
    const buyTransaction = await contracts?.dataProviderToken.buy(recordCount);
    await buyTransaction.wait();
    setRecords(await buyData(recordCount, address || ''));

    setConfirmation('Buying ' + recordCount + ' records successful');
  }

  return (
    <div>
      <button onClick={ (e) => handleError(buyTokens) }>Buy Data Access Tokens</button>
      <button onClick={ (e) => handleError(buyRecords) }>Buy Records</button>
      { records && records.length > 0 &&
        (<div>
          <h1>Records</h1>
          <ul>
            { records.map((record, index) => (<li key={ index }>{ JSON.stringify(record) }</li>)) }
          </ul>
        </div>)
      }
    </div>
  );
}

export default BuyView;