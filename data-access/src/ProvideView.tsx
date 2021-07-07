import React, { useContext, useState } from 'react';
import { EthereumData, Contracts, LogData, Record, SignedTransaction } from './utils/types';
import { provideData } from './utils/service';
import { EthereumContext, LogContext } from './App';

const ProvideView = () => {
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

  const provide = async () => {
    const signedTransaction: SignedTransaction = await provideData(address || '');

    const provideTransaction = await contracts?.dataProviderToken.provide(signedTransaction.provideTransaction.recordCount, signedTransaction.provideTransaction.timestamp, signedTransaction.signature);
    await provideTransaction.wait();
    setConfirmation('Providing records successful');
  }

  return (
    <div>
      <button onClick={ (e) => handleError(provide) }>Provide records</button>
    </div>
  );
}

export default ProvideView;