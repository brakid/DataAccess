import React, { useContext, useEffect, useState } from 'react';
import { get, LARGE_ALLOWANCE } from './utils/helpers';
import { utils } from 'ethers';
import { EthereumData, Contracts, LogData, Record } from './utils/types';
import { buyRecords, recordCountAvailable } from './utils/service';
import { EthereumContext, LogContext } from './App';
import { greaterEqualZero, IntInputField } from './utils/InputField';

const BuyView = () => {
  const { signer, address, data: contracts }  = useContext<EthereumData<Contracts>>(EthereumContext);
  const { setError, setConfirmation }  = useContext<LogData>(LogContext);
  const [ availableRecordCount, setAvailableRecordCount ] = useState<number>(0);
  const [ tokenCount, setTokenCount ] = useState<number>(0);
  const [ recordCount, setRecordCount ] = useState<number>(0);
  const [ records, setRecords ] = useState<Record[]>([]);

  useEffect(() => {
    const getBalances = async () => {
        setAvailableRecordCount(await recordCountAvailable());
    };

    getBalances();
  }, []);

  const handleError = async (call: () => Promise<void>) => {
    try {
      setError('');
      setConfirmation('');
      await call()
    } catch (e) {
      setError(JSON.stringify(e));
    }
  }

  const buyAccessTokensCall = async () => {
    const usdcAllowance = await contracts?.usdc.allowance(address, contracts.dataAccessToken.address);
    if (usdcAllowance < 1) {
      await contracts?.usdc.increaseAllowance(contracts.dataAccessToken.address, LARGE_ALLOWANCE);
    }

    const buyTransaction = await contracts?.dataAccessToken.mint(utils.parseUnits("100", 18));
    await buyTransaction.wait();
    setConfirmation('Buying access tokens successful');
  }

  const buyRecordsCall = async (recordCount: number) => {
    const dataAccessTokenAllowance = await contracts?.dataAccessToken.allowance(address, contracts.dataProviderToken.address);
    if (dataAccessTokenAllowance < 1) { 
      await contracts?.dataAccessToken.increaseAllowance(contracts.dataProviderToken.address, LARGE_ALLOWANCE);
    }

    const recordCountToBuy = Math.min(recordCount, await recordCountAvailable());
    setRecordCount(recordCountToBuy);

    const buyTransaction = await contracts?.dataProviderToken.buy(recordCountToBuy);
    await buyTransaction.wait();
    const hash = utils.solidityKeccak256(['address', 'uint256'], [get(address), recordCountToBuy]);
    const signature = get(await signer?.signMessage(hash));
    setRecords(await buyRecords(recordCountToBuy, get(address), signature));

    setConfirmation('Successfully bought ' + recordCountToBuy + ' records');
  }

  const updateRecordCount = (recordCount: number): void => {
    if (recordCount > availableRecordCount) {
      setError('The database has ' + availableRecordCount + ' records');
    }
  }

  const sign = async () => {
    const hash = utils.solidityKeccak256(['address', 'uint256'], [get(address), 10]);
    const signature = get(await signer?.signMessage(hash));
    console.log('Signature1: ' + signature);

    console.log(await utils.verifyMessage(hash, signature) === address);
    console.log(address);
    return;
  };

  return (
    <div>
      <button onClick={ (e) => sign() }>Sign</button>
        
      <div className='form-group'>
        <IntInputField value={ tokenCount } returnValue={ greaterEqualZero(setTokenCount) } handleError={ setError } />
        <button onClick={ (e) => handleError(buyAccessTokensCall) }>Buy Data Access Tokens</button>
        This will cost { tokenCount } USDC.
        <IntInputField value={ recordCount } returnValue={ greaterEqualZero(updateRecordCount) } handleError={ setError } />
        <button onClick={ (e) => handleError(() => buyRecordsCall(recordCount)) }>Buy Records</button>
        This will cost { recordCount / 1000.0 } DataAccessTokens.
      </div>
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