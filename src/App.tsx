
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import XRPWallet from './Wallet'
import toast from 'react-hot-toast'

function App() {

  const [seedKey, setSeedKey] = useState('')
  useEffect(() => {
    chrome.storage?.sync.get(["seed"]).then((result: any) => {
      setSeedKey(result.seed)
    }).catch(e => {
      toast.error(`${e}`, {
        duration: 3000,
        position: "bottom-center"
      });
    });

  }, [seedKey])
  useEffect(() => {
    const listener = () => {
      chrome.storage.sync.get(["seed"], (value: any) => {
        if (value['seed'] == undefined) {
          setSeedKey('')
        }
      })
    };
    chrome.storage?.onChanged.addListener(listener);
    return () => {
      chrome.storage?.onChanged.removeListener(listener);
    };
  }, []);

  return (

    !!seedKey ? (<XRPWallet seed={seedKey} />) : (<Login onSeed={(seed: any) => setSeedKey(seed)} />)

  )
}

export default App
