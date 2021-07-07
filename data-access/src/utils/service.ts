import { Record, SignedTransaction } from "./types";

export const provideData = async (senderAddress: string): Promise<SignedTransaction> => {
  const records: Record[] = [ { age: 1, weight: 10, height: 5 }, { age: 2, weight: 20, height: 10 } ];

  try {
    const response = await fetch('http://localhost:8080/provide', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records, senderAddress })
    });
      
    const jsonContent = await response.json();
    
    return jsonContent;
  } catch (e) {
    throw new Error(e);
  }
}

export const recordCountAvailable = async (): Promise<number> => {
  try {
    const response = await fetch('http://localhost:8080/records', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
      
    const jsonContent = await response.json();
    
    return jsonContent;
  } catch (e) {
    throw new Error(e);
  }
}

export const buyData = async (recordCount: number, buyerAddress: string): Promise<Record[]> => {
  try {
    const response = await fetch('http://localhost:8080/buy', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recordCount, buyerAddress })
    });
      
    const jsonContent = await response.json();
    
    return jsonContent;
  } catch (e) {
    throw new Error(e);
  }
}