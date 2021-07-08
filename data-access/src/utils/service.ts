import { Record, SignedTransaction } from "./types";

export const provideRecords = async (senderAddress: string, records: Record[]): Promise<SignedTransaction> => {
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

export const buyRecords = async (recordCount: number, buyerAddress: string, signature: string): Promise<Record[]> => {
  try {
    const response = await fetch('http://localhost:8080/buy', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recordCount, buyerAddress, signature })
    });
      
    const jsonContent = await response.json();
    
    return jsonContent;
  } catch (e) {
    throw new Error(e);
  }
}