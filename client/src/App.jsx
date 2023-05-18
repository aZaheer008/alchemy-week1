import Wallet from "./Wallet";
import Dwallet from "./Dwallet";
import Transfer from "./Transfer";
import Dtransfer from "./Dtransfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [dbalance, setDbalance] = useState(0);
  const [address, setAddress] = useState("");
  const [user, setUser] = useState("");
  const [privateKey, setPrivateKey] = useState("");


  return (
    <div className="app flex" style={{"flexFlow":"column"}}>
      <div className="flexprivatekey" >
        <Wallet
          balance={balance}
          privateKey={privateKey}
          setPrivateKey={setPrivateKey}
          setBalance={setBalance}
          address={address}
          setAddress={setAddress}
        />
        <Transfer setBalance={setBalance} address={address} />
      </div>
      <div className="flex walletbreaker"></div>
      <div className="flexprivatekey" >
        <Dwallet
          dbalance={dbalance}
          setDbalance={setDbalance}
          user={user}
          setUser={setUser}
        />
        <Dtransfer balance={dbalance}
          setDbalance={setDbalance}
          user={user}
          setUser={setUser} />
      </div>
    </div>
  );
}

export default App;
