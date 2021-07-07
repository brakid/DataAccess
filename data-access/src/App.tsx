import React, { useEffect, useState } from 'react';
import Header from './Header';
import { getContracts } from './utils/contracts';
import { getWeb3Provider, getWebsocketProvider } from './utils/ethereum';
import { showConfirmation, showError } from './utils/helpers';
import { EthereumData, Contracts, Providers, Block, LogData } from './utils/types';
import BuyView from './BuyView';
import ProvideView from './ProvideView';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import About from './About';

export const defaultBlock: Block = {
  blockNumber: -1,
  timestamp: new Date(),
};

export const EthereumContext = React.createContext<EthereumData<Contracts>>({ block: defaultBlock });
export const LogContext = React.createContext<LogData>({ setError: (_) => {} , setConfirmation: (_) => {} });

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

  return (
    <EthereumContext.Provider value={ { ...providers, address, data: contracts, block } }>
      <LogContext.Provider value={{ setError, setConfirmation}}>
        <Router>
          <Header />
          { error && showError(error) }
          { confirmation && showConfirmation(confirmation) }
          <main role='main'>
            <ul>
              <li><Link to='/buy'>Buy Records</Link></li>
              <li><Link to='/provide'>Provide Records</Link></li>
            </ul>
            <Switch>
              <Route path='/buy'>
                <BuyView />
              </Route>
              <Route path='/provide'>
                <ProvideView />
              </Route>
              <Route path='/'>
                <About />
              </Route>
            </Switch>
          </main>
          <footer className='navbar navbar-expand-lg navbar-dark bg-dark text-light mt-5'>
            <div className='container justify-content-md-center'>
              <div className='col-sm-3 text-sm-left text-center'>Blocknumber: { block.blockNumber }</div>
              <div className='col-sm-3 text-sm-right text-center'>&copy; Hagen Schupp 2021</div>
            </div>
          </footer>
        </Router>
      </LogContext.Provider>
    </EthereumContext.Provider>
  );
}

export default App;