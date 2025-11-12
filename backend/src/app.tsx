import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';
import './App.css';

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [networkName, setNetworkName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  
  // State for read function
  const [readAddress, setReadAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  
  // State for write function
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      setStatus('Connecting to wallet...');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      // Create provider
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Get signer
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      // Get network info
      const network = await web3Provider.getNetwork();
      setNetworkName(network.name || `Chain ID: ${network.chainId}`);

      // Create contract instance
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Signer
      );
      setContract(contractInstance);

      // Set account
      setAccount(accounts[0]);
      setIsConnected(true);
      setStatus('Wallet connected successfully!');

      console.log('Connected to:', accounts[0]);
      console.log('Network:', network);
      console.log('Contract:', contractInstance);

    } catch (error) {
      console.error('Connection error:', error);
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setNetworkName('');
    setBalance('');
    setStatus('Wallet disconnected');
  };

  // Read balance (example view function - FREE, no gas)
  const readBalance = async () => {
    if (!contract) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      if (!readAddress || !ethers.isAddress(readAddress)) {
        setStatus('Please enter a valid address');
        return;
      }

      setStatus('Reading balance from contract...');

      // Call view function (no gas required)
      const bal = await contract.balanceOf(readAddress);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      // Format balance
      const formattedBalance = ethers.formatUnits(bal, decimals);
      setBalance(`${formattedBalance} ${symbol}`);
      setStatus('Balance retrieved successfully!');

    } catch (error) {
      console.error('Read error:', error);
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  // Transfer tokens (example transaction - COSTS GAS)
  const transferTokens = async () => {
    if (!contract) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
        setStatus('Please enter a valid recipient address');
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        setStatus('Please enter a valid amount');
        return;
      }

      setStatus('Preparing transaction...');

      // Get decimals for proper conversion
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);

      setStatus('Waiting for transaction approval...');

      // Send transaction
      const tx = await contract.transfer(recipientAddress, amountInWei);
      
      setStatus(`Transaction sent! Hash: ${tx.hash}`);
      console.log('Transaction:', tx);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      setStatus(`Transaction confirmed in block ${receipt?.blockNumber}!`);
      
      // Clear form
      setRecipientAddress('');
      setAmount('');

    } catch (error) {
      console.error('Transaction error:', error);
      setStatus(`Transaction failed: ${(error as Error).message}`);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setStatus('Account changed');
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <div className="card">
          <h1>Smart Contract DApp</h1>
          <p className="subtitle">Connect your wallet to interact with the contract</p>
        </div>

        {/* Connection Status */}
        <div className="card">
          <h2>Connection Status</h2>

          {!isConnected ? (
            <div className="connect-container">
              <div className="wallet-icon">⚡</div>
              <button className="btn" onClick={connectWallet}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="info-box info-box-green">
                <div>
                  <div className="info-label">Connected Account</div>
                  <div className="info-value">{account}</div>
                </div>
                <div className="status-dot"></div>
              </div>

              <div className="info-box info-box-blue">
                <div>
                  <div className="info-label">Network</div>
                  <div className="info-value">{networkName}</div>
                </div>
              </div>

              <div className="info-box info-box-purple">
                <div>
                  <div className="info-label">Contract Address</div>
                  <div className="info-value">{CONTRACT_ADDRESS}</div>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Contract Interactions */}
        {isConnected && (
          <div className="card">
            <h2>Contract Interactions</h2>

            {/* Read Balance */}
            <div className="section">
              <h3>Read Balance (Free - No Gas)</h3>
              <div className="input-group">
                <label>Address to Check:</label>
                <input
                  type="text"
                  value={readAddress}
                  onChange={(e) => setReadAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <button className="btn btn-blue" onClick={readBalance}>
                Read Balance
              </button>
              {balance && (
                <div className="result-box">
                  <strong>Balance:</strong> {balance}
                </div>
              )}
            </div>

            {/* Transfer Tokens */}
            <div className="section">
              <h3>Transfer Tokens (Costs Gas)</h3>
              <div className="input-group">
                <label>Recipient Address:</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="input-group">
                <label>Amount:</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                />
              </div>
              <button className="btn btn-purple" onClick={transferTokens}>
                Transfer Tokens
              </button>
            </div>

            <div className="info-box info-box-yellow">
              <div className="info-text">
                <strong>Note:</strong> Make sure the contract address and ABI are correctly set in contractConfig.ts
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status && (
          <div className="card">
            <h2>Status</h2>
            <div className="status-message">{status}</div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="card">
          <h2>Setup Instructions</h2>
          <ol className="instructions">
            <li>
              Open <code>src/contractConfig.ts</code> and replace <code>CONTRACT_ADDRESS</code> with your deployed contract address
            </li>
            <li>
              In the same file, replace <code>CONTRACT_ABI</code> with your ABI from Remix
            </li>
            <li>
              Make sure MetaMask is installed and connected to the correct network
            </li>
            <li>
              Click "Connect Wallet" above to start interacting with your contract
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;