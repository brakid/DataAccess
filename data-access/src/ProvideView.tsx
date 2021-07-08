import React, { useContext, useState } from 'react';
import { EthereumData, Contracts, LogData, Record, SignedTransaction } from './utils/types';
import { provideRecords } from './utils/service';
import { EthereumContext, LogContext } from './App';
import { get } from './utils/helpers';

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
    const records: Record[] = [ { age: 1, weight: 10, height: 5 }, { age: 2, weight: 20, height: 10 } ];
    const signedTransaction: SignedTransaction = await provideRecords(get(address), records);

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