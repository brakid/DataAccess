import React, { useEffect, useState } from 'react';
import Header from './Header';
import { getContracts } from './utils/contracts';
import { getWeb3Provider, getWebsocketProvider } from './utils/ethereum';
import { LARGE_ALLOWANCE, showConfirmation, showError } from './utils/helpers';
import { utils } from 'ethers';
import { EthereumData, Contracts, Providers, Block, SignedTransaction } from './utils/types';
import { buyData, provideData } from './utils/service';

export const defaultBlock: Block = {
  blockNumber: -1,
  timestamp: new Date(),
};

export const EthereumContext = React.createContext<EthereumData<Contracts>>({ block: defaultBlock });

const App = () => {
  const [ providers, setProviders ] = useState<Providers>();
  const [ address, setAddress ] = useState<string>();
  const [ block, setBlock ] = useState<Block>(defaultBlock);
  const [ contracts, setContracts ] = useState<Contracts>();
  const [ error, setError ] = useState<string>();
  const [ confirmation, setConfirmation ] = useState<string>();

  useEffect(() => {
    const init = async () => {
      const web3Provider = await getWeb3Provider();
      const websocketProvider = await getWebsocketProvider();

      setBlock({
        blockNumber: await websocketProvider.getBlockNumber(),
        timestamp: new Date(),
      });
      websocketProvider.on('block', (latestBlockNumber) => {
        setBlock({
          blockNumber: latestBlockNumber,
          timestamp: new Date()
        });
      });

      setInterval(async () => {
        setBlock({
          blockNumber: await websocketProvider.getBlockNumber(),
          timestamp: new Date(),
        });
      }, 2000);

      setProviders({ web3Provider, websocketProvider });
      setAddress(await web3Provider.getSigner().getAddress());
      setContracts(getContracts(web3Provider));
    };

    init();
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

  const buyTokens = async () => {
    const usdcAllowance = await contracts?.usdc.allowance(address, contracts.dataAccessToken.address);
    if (usdcAllowance < 1) {
      await contracts?.usdc.increaseAllowance(contracts.dataAccessToken.address, LARGE_ALLOWANCE);
    }

    const buyTransaction = await contracts?.dataAccessToken.mint(utils.parseUnits("100", 18));
    await buyTransaction.wait();
    setConfirmation('Buying access tokens successful');
  }

  const buyAccess = async () => {
    const dataAccessTokenAllowance = await contracts?.dataAccessToken.allowance(address, contracts.dataProviderToken.address);
    if (dataAccessTokenAllowance < 1) { 
      await contracts?.dataAccessToken.increaseAllowance(contracts.dataProviderToken.address, LARGE_ALLOWANCE);
    }

    const buyTransaction = await contracts?.dataProviderToken.buy(1000);
    await buyTransaction.wait();
    setConfirmation('Buying records successful');
    console.log(await buyData(1000, address || ''));
  }

  const provide = async () => {
    const signedTransaction: SignedTransaction = await provideData(address || '');

    const provideTransaction = await contracts?.dataProviderToken.provide(signedTransaction.provideTransaction.recordCount, signedTransaction.provideTransaction.timestamp, signedTransaction.signature);
    await provideTransaction.wait();
    setConfirmation('Providing records successful');
  }

  const claim = async () => {
    const claimTransaction = await contracts?.dataProviderToken.claim();
    await claimTransaction.wait();
    setConfirmation('Claiming earnings successful');
  }

  return (
    <EthereumContext.Provider value={ { ...providers, address, data: contracts, block } }>
      <Header />
      { error && showError(error) }
      { confirmation && showConfirmation(confirmation) }
      <main role='main'>
        <button onClick={ (e) => handleError(buyTokens) }>Buy Data Access Tokens</button>
        <button onClick={ (e) => handleError(buyAccess) }>Buy Access</button>
        <button onClick={ (e) => handleError(provide) }>Provide Data</button>
        <button onClick={ (e) => handleError(claim) }>Claim Earnings</button>
      </main>
      <footer className='navbar navbar-expand-lg navbar-dark bg-dark text-light mt-5'>
        <div className='container justify-content-md-center'>
          <div className='col-sm-3 text-sm-left text-center'>Blocknumber: { block.blockNumber }</div>
          <div className='col-sm-3 text-sm-right text-center'>&copy; Hagen Schupp 2021</div>
        </div>
      </footer>
    </EthereumContext.Provider>
  );
}

export default App;