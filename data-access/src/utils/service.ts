import { SignedTransaction } from "./types";

export const provideData = async (senderAddress: string): Promise<SignedTransaction> => {
  try {
    const response = await fetch('http://localhost:8080/provide', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [ { age: 1, weight: 10, height: 5 }], senderAddress })
    });
      
    const jsonContent = await response.json();

    return {
      provideTransaction: {
        recordCount: jsonContent['ProvideTransaction']['RecordCount'],
        timestamp: jsonContent['ProvideTransaction']['Timestamp'],
        senderAddress: jsonContent['ProvideTransaction']['SenderAddress'],
      },
      signature: jsonContent['Signature']
    }
  } catch (e) {
    throw new Error(e);
  }
}

export const buyData = async (recordCount: number, buyerAddress: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8080/buy', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recordCount, buyerAddress })
    });
      
    const jsonContent = await response.text();
    
    return JSON.stringify(jsonContent);
  } catch (e) {
    throw new Error(e);
  }
}