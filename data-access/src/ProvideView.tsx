import React, { useContext, useState } from 'react';
import { EthereumData, Contracts, LogData, Record, SignedTransaction } from './utils/types';
import { provideRecords } from './utils/service';
import { EthereumContext, LogContext } from './App';
import { get } from './utils/helpers';
import { IntInputField, greaterEqualZero } from './utils/InputField';

interface AddRecordProps {
  addRecord: (record: Record) => void,
  handleError: (error: string) => void,
};

const AddRecord = ({ addRecord, handleError }: AddRecordProps) => {
  const [ age, setAge ] = useState<number>();
  const [ height, setHeight ] = useState<number>();
  const [ weight, setWeight ] = useState<number>();

  const add = (): void => {
    if (age && height && weight) {
      addRecord({ age, height, weight });
      setAge(undefined);
      setHeight(undefined);
      setWeight(undefined);
    }
  };

  return (
    <div>
      <label>Age:</label>
      <IntInputField value={ age } returnValue={ greaterEqualZero(setAge) } handleError={ handleError } />
      <label>Height:</label>
      <IntInputField value={ height } returnValue={ greaterEqualZero(setHeight) } handleError={ handleError } />
      <label>Weight:</label>
      <IntInputField value={ weight } returnValue={ greaterEqualZero(setWeight) } handleError={ handleError } />
      <button onClick={ (e) => add() }>Add Record</button>
    </div>
  );
};

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
    if (!!!records || records.length === 0) {
      setError('Need to provide at least one record');
      return;
    }

    const signedTransaction: SignedTransaction = await provideRecords(get(address), records);

    const provideTransaction = await contracts?.dataProviderToken.provide(signedTransaction.provideTransaction.recordCount, signedTransaction.provideTransaction.timestamp, signedTransaction.signature);
    await provideTransaction.wait();
    setConfirmation('Successfully provided ' + records.length + ' records');
    setRecords([]);
  }

  const addRecord = (record: Record): void => {
    const newRecords = records.slice(0);
    newRecords.push(record);
    setRecords(newRecords);
  }

  return (
    <div>
      <button onClick={ (e) => handleError(provide) }>Provide records</button>
      <section>
        <h2>Records to provide</h2>
        <ul>
          { records.map((record, index) => 
            (<li key={ index }>{ JSON.stringify(record) }</li>)
          )}
        </ul>
        <AddRecord addRecord={ addRecord } handleError={ setError } />
      </section>
    </div>
  );
}

export default ProvideView;