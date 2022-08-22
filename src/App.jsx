import React, { useEffect, useState } from 'react';
import idl from './idl.json';
import twitterLogo from './assets/twitter-logo.svg';
import happyUnscreen from './assets/happy-unscreen.gif';
import doodhMeme from './assets/doodhMeme.png';
import thakGaye from './assets/thakGaye.png';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { Buffer } from 'buffer';
import kp from './keypair.json'


window.Buffer = Buffer;

const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
}
// Constants
const TWITTER_HANDLE = 'Rishi_o07';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
const [walletAddress, setWalletAddress] = useState(null);
const [inputValue, setInputValue] = useState('');
const [gifList, setGifList] = useState([]);
const [btn,setbtn] = useState('🌙');
const [vote,setVote] = useState(0);
useEffect(() => {
    connectWallet();
  },[])
const upvote = () => {
  setVote(vote+1);
}


const toggleBtn = () => {
  if (btn == '🌙'){
    setbtn('🌞');
    setTheme('light');
  }
  else
  {
    setbtn('🌙');
    setTheme('dark');
  }
}

const [theme,setTheme] = useState('dark');
 
  
const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;

    if (solana) {
      if (solana.isPhantom) {
        console.log('Phantom wallet found!');
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key:',
          response.publicKey.toString()
        );
      }
    } else {
      alert('Solana object not found! Get a Phantom Wallet 👻');
    }
  } catch (error) {
    console.error(error);
  }
};
const connectWallet = async () => {if (solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }};

const disconnectWallet = async () => {
  setWalletAddress(null);
}


 const sendGif = async () => {
  if (inputValue.length === 0) {
    console.log("No gif link given!")
    return
  }
  setInputValue('');
  console.log('Gif link:', inputValue);
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.addGif(inputValue, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    console.log("GIF successfully sent to program", inputValue)

    await getGifList();
  } catch (error) {
    console.log("Error sending GIF:", error)
  }
};
  const onInputChange = (event) => {
  const { value } = event.target;
  setInputValue(value);
};

  const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
	return provider;
}

  const createGifAccount = async () => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    console.log("ping")
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });
    console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
    await getGifList();

  } catch(error) {
    console.log("Error creating BaseAccount account:", error)
  }
}


  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */

  const renderConnectedContainer = () => {

    if (gifList === null) {
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } 
	// Otherwise, we're good! Account exists. User can submit GIFs.
	else {
    return(
      <div className="connected-container">
        <p className="sub-text">View memes in the metaverse ✨</p><button className="cta-button disconnect-wallet-button" onClick={disconnectWallet}>Disconnect</button>
        
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
					{/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
        item.gifLink !='https://c.tenor.com/uJ39DLSDjscAAAAd/sex-make-out.gif'? <div className="gif-item" key={index}>
              
          <img src={item.gifLink} /> 
              <button onClick={upvote.index}>👍🏻<span>{vote} votes</span></button>
              <p>{item.userAddress.toString()}</p>
            </div> :''
          ))}
        </div>
      </div>
    )
  }
}

  const renderNotConnectedContainer = () => (
    <div className="container">
      <div className="header-container">
          <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect to Wallet
      </button>
          <p className="header">Meme World!</p>
          <p className="sub-text">View memes in the metaverse ✨</p>
        </div>
      
      <div className="thak">
        <img className="thakGaye" src={thakGaye} />
        <div className="cloud">
          <p>थक गये होंगे <span>Memes</span> देखते देखते!</p>
        </div>
      </div>
      
      
    </div>
    
  );

/*
 * When our component first mounts, let's check to see if we have a connected
 * Phantom Wallet
 */
useEffect(() => {
  const onLoad = async () => {
    await checkIfWalletIsConnected();
  };
  window.addEventListener('load', onLoad);
  return () => window.removeEventListener('load', onLoad);
}, []);
  
const getGifList = async() => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    console.log("Got the account", account)
    setGifList(account.gifList)

  } catch (error) {
    console.log("Error in getGifList: ", error)
    setGifList(null);
  }
}
useEffect(() => {
  if (walletAddress) {
    console.log('Fetching GIF list...');
    getGifList()
  }
}, [walletAddress]);

  return (
    <div className="App" id = {theme}>
      
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <button className="toggleBtn" onClick= {toggleBtn}>{btn}</button>
        {!walletAddress &&renderNotConnectedContainer()}
        {walletAddress && renderConnectedContainer()}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  
  );
};

export default App;
