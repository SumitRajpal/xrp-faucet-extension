
import './App.css'
import logo from '../public/background-faucet.png'
import { InfinitySpin } from 'react-loader-spinner'
import { Client, Wallet } from 'xrpl'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
interface ILogin {
  onSeed(value: any): any;
}
const Login = (props: ILogin) => {
  const { onSeed } = props
  const [spinner, setSpinner] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [wallet, setWallet] = useState<any>({})
  const [accountType, setAccountType] = useState('old')
  const client = new Client("wss://s.devnet.rippletest.net:51233/")
  const createWallet = async () => {
    if (!spinner) {
      setSpinner(true)
      try {
        await client.connect()
        if (client.isConnected()) {
          const { wallet } = await client.fundWallet()
          setWallet(wallet)
          client.disconnect()
          setAccountType("old")
          toast.success(`Account Created `, {
            duration: 3000,
            position: "bottom-center"
          });
        }
      } catch (e: any) {
        toast.error(`${e.message}`, {
          duration: 3000,
          position: "bottom-center"
        });
        setSpinner(false)
      }
      setSpinner(false)
    }
  }

  const setSeedStorage = (seed: string) => {
    chrome.storage.sync.set({ seed }).then(() => {
      setSpinner(false)
    }).catch(e => {
      toast.error(`${e?.message}`, {
        duration: 3000,
        position: "bottom-center"
      });
      setSpinner(false)
    });
  }



  const oldWallet = async () => {
    if (!spinner) {
      setSpinner(true)
      await client.connect()
      if (client.isConnected()) {

        try {
          const wallet = await Wallet.fromSeed(inputValue)
          if (wallet?.seed) {
            onSeed(wallet.seed)
            setSeedStorage(wallet?.seed);
          }
          client.disconnect()
          setSpinner(false)
        } catch (e: any) {
          toast.error(`${e.message}`, {
            duration: 3000,
            position: "bottom-center"
          });
          setSpinner(false)
        }
      }
    }
  }
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 300, padding: 10 }} >
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },

          // Default options for specific types
          success: {
            duration: 3000
          },
        }}
      />

      <div className='grid-container'>
        <div className='grid-item'>
          <div >
            <div className="bold" style={{ fontSize: 24, flex: 1 }} >
              Welcome to <br />
              XRP Faucet
            </div>
          </div>
        </div>
        <div className='grid-item'>
          {spinner ?
            <InfinitySpin
              width={"200"}
              color={"#b465e9"}
            /> : <img className="backgroundfaucet" src={logo} style={{
              height: 160, width: 160
            }} />
          }
        </div>
        <div className='grid-item' style={{ placeContent: "end" }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 40 }}>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', placeContent: "center", gap: 4 }}>
              <div className={(accountType == 'new') ? 'tab active' : 'tab'} onClick={() => setAccountType('old')}>Already have account</div>
              <div className={accountType == 'old' ? 'tab active' : 'tab'} onClick={() => setAccountType('new')}>Create new account</div>
            </div>
            {(accountType == 'old') &&
              <input
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value) }}
                className='inputClass' placeholder='Enter seed key' style={{}} />}
            {(accountType == 'old') && <div className="button1" onClick={oldWallet}>Already have seed</div>}
            {(accountType == 'new') && <div className="button1" onClick={createWallet}>Create new account</div>}

            {wallet?.seed && <div className="regular" style={{ fontSize: 12, flex: 1, textAlign: "start" }} >
              Seed : {wallet.seed} <br />
            </div>}
            <div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
