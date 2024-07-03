
import './App.css'
import { Client, dropsToXrp, Wallet, xrpToDrops } from 'xrpl'
import { useEffect, useMemo, useState } from 'react'
import xrp from '../public/xrp.png'
import { InfinitySpin } from 'react-loader-spinner'
import toast, { Toaster } from 'react-hot-toast'
interface ISeed {
  seed: any
}
const XRPWallet = (props: ISeed) => {
  const { seed } = props
  const [spinner, setSpinner] = useState(false)
  const [type, setType] = useState('send')
  const [xrpValue, setXrpValue] = useState(0)
  const [balance, setBalance] = useState(0)
  const [sendAddress, setSendAddress] = useState('')
  const [transactions, setTransactions] = useState<any>()
  const [wallet, setWallet] = useState({ classicAddress: '' })
  const client = new Client("wss://s.devnet.rippletest.net:51233/")

  useEffect(() => {
    getXRP()
  }, [seed])

  const getXRP = async () => {
    if (!spinner) {
      setSpinner(true)
      try {
        await client.connect()
        if (client.isConnected()) {
          const wallet = await Wallet.fromSeed(seed)
          setWallet(wallet)
          const balance = await client.getXrpBalance(wallet.classicAddress)
          setBalance(balance)
          client.disconnect()
        }
      }
      catch (e: any) {
        toast.error(`${e.message}`, {
          duration: 3000,
          position: "bottom-center"
        });
      }

      setSpinner(false)
    }
  }



  const fundWallet = async () => {
    if (!spinner) {
      setSpinner(true)
      try {
        await client.connect();
        const eWallet = await Wallet.fromSeed(seed)
        const { balance } = await client.fundWallet(eWallet)
        setBalance(balance)
        toast.success(`${balance} added successfully`);
        client.disconnect()
      }
      catch (e: any) {
        toast.error(`${e.message}`, {
          duration: 3000,
          position: "bottom-center"
        });
      }
    }
    setSpinner(false)
  }
  const getTransaction = async () => {
    if (!spinner) {
      setSpinner(true)
      await client.connect();
      const request = await client.request({
        command: "account_tx",
        account: wallet?.classicAddress
      })
      setTransactions(request?.result?.transactions)
      client.disconnect()
    }
    setSpinner(false)
  }
  const logout = async () => {
    chrome.storage.sync.remove(['seed'], function () {
      toast.success(`You are logged out`, {
        duration: 3000,
        position: "bottom-center"
      });
      // window.close();
    });
  }
  const filteredTransactions = useMemo(() => transactions?.map((trx: any) => trx.tx) || [], [transactions])
  const sendXRP = async () => {
    if (sendAddress && xrpValue) {
      if (!spinner) {
        setSpinner(true)
        try {
          await client.connect();
          const wallet = await Wallet.fromSeed(seed)
          const preparedTransaction = await client.autofill({
            TransactionType: "Payment",
            Account: wallet.classicAddress,
            Amount: xrpToDrops(xrpValue),
            Destination: sendAddress
          })
          const signed = wallet.sign(preparedTransaction)
          await client.submitAndWait(signed.tx_blob)
          toast.success(`${xrpValue} send successfully to ${sendAddress}`, {
            duration: 3000,
            position: "bottom-center"
          });
        } catch (e: any) {
          toast.error(`${e.message}`, {
            duration: 3000,
            position: "bottom-center"
          });
        }
      }
    }
    setSpinner(false)
    setSendAddress('')
    setXrpValue(0)
    getXRP()
  }
  return (
    <div style={{ padding: 5, maxWidth: "1280px" }}>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
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
      <div className="regular" style={{ fontSize: 20, position: "absolute", right: 10, top: 10, cursor: "pointer" }} onClick={logout}>
        Sign out
      </div>
      <div className='grid-container'>
        <div className='grid-item'>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 10, alignItems: "center" }}>

            {spinner ?
              <InfinitySpin
                width={"200"}
                color={"#b465e9"}
              />
              : <img className="backgroundfaucet" src={xrp} style={{ width: 72, height: 72 }} />}
            <div className="bold" style={{ fontSize: 20, flex: 1 }} >
              {balance} XRP
            </div>
            <div className="regular" style={{ fontSize: 20, flex: 1 }} >
              My Address : {wallet.classicAddress}
            </div>
          </div>
        </div>
        <div className='grid-item'>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: "center", gap: 4, marginLeft: 20, marginRight: 20 }}>
            <div className={(type == 'send') ? 'tab active' : 'tab'} onClick={() => setType('send')}>Send</div>
            <div className={type == 'rec' ? 'tab active' : 'tab'} onClick={() => setType('rec')}>Receive</div>
            <div className={type == 'list' ? 'tab active' : 'tab'} onClick={() => { setType('list'); getTransaction() }} >Transaction</div>
          </div>
        </div>
        <div className='grid-item'>


          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: "center", gap: 20, border: 10 }}>
            {type == 'send' && <input
              value={sendAddress}
              type='text'
              onChange={(e) => { setSendAddress(e.target.value) }}
              className='inputClass' placeholder='Enter Address' style={{}} />}
            {type == 'send' && <input
              value={xrpValue}
              type='number'
              max={balance}
              onChange={(e) => {
                const xrp = Number(e.target.value) > balance ? balance : Number(e.target.value || 0)
                setXrpValue(xrp)
              }
              }
              className='inputClass' placeholder='Enter XRP' style={{}} />}
            {type == 'send' && <div className="button1" onClick={sendXRP}>Send XRP</div>}
            {type == 'rec' && <div className="button1" onClick={fundWallet}>Fund my wallet</div>}
            {
              type == 'list' && <div style={{ overflowY: "auto", height: 200 }}>
                {filteredTransactions?.map((trx: any) =>

                  <div className={trx.Destination == wallet.classicAddress ? "rcard" : 'scard'} style={{ display: 'flex', gap: 10, flex: 1, flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                    <div className="regular" style={{ fontSize: 20, flex: 1, flexBasis: 80 }} >
                      {trx.Destination == wallet.classicAddress ? trx.Account : trx.Destination}
                    </div>
                    <div className="regular" style={{ fontSize: 20, flex: 1, flexBasis: 20, textAlign: "right" }} >
                      {dropsToXrp(trx.Amount)} XRP
                    </div>
                  </div>

                )}
              </div>
            }
          </div>

        </div>
      </div>


    </div>
  )
}

export default XRPWallet
