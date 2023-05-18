import { useState,useEffect } from "react";
import * as secp256k1 from '@noble/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak";
import {utf8ToBytes} from "ethereum-cryptography/utils";
import server from "./server";

function Dtransfer({ dbalance, setDbalance,user,setUser,address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [wallets, setWallets] = useState([]);
  const [recuser, setRecuser] = useState("");
  const [privateKeys, setPrivateKeys] = useState({});

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      
      const tx = {
        sender: user.address,
        amount: parseInt(sendAmount),
        recipient
      };
      const txHash = keccak256(utf8ToBytes(JSON.stringify(tx)));
      let privateKey = privateKeys[user.address]
      const signature = await secp256k1.sign(txHash, privateKey, {recovered:true});

			const {
				data: { balance },
			} = await server.post(`dsend`, {
				amount: parseInt(sendAmount),
				recipient,
				signature,
				txHash
			});
			setDbalance(balance);
		} catch (ex) {
			alert(ex.response.data.message);
		}
  };

  const onSelectUser = async(evt) => {

    let user = JSON.parse(evt.target.value);
    setRecipient(user.address);
    setRecuser(user);

};

useEffect(() => {
  (async () => {
      let {data : {wallets} } = await server.get(`wallets`);
      let {data : {privateKeys} } = await server.get(`keys`);
      setWallets(wallets);
      setPrivateKeys(privateKeys);
  })();
},[]);

  return (
    <form className="container transfer wallet" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label> Recipient Address </label>
      <select onChange={onSelectUser} value={recuser}>
          <option value="">--- please choose a user wallet ---</option>
              {wallets.map((u, i) => (
                  <option key={i} value={JSON.stringify(u)}>
                      {u.name}
                  </option>
          ))}
      </select>
      {
            recuser && (
                <>
                    <div className="balance">Address: {recuser.address.slice(-20).toUpperCase()}</div>
                </>
            )
        }

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Dtransfer;
