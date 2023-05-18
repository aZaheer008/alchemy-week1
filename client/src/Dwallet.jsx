import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {toHex} from "ethereum-cryptography/utils";
import { useState,useEffect } from "react";

function Dwallet({ dbalance, setDbalance,user,setUser }) {

    const [wallets, setWallets] = useState([]);

    async function onChange(evt) {
        const privateKey = evt.target.value;
        setPrivateKey(privateKey);
        const address =  toHex(secp.secp256k1.getPublicKey(privateKey));
        setAddress(address)
        if (address) {
        const {
            data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
        } else {
        setBalance(0);
        }
    }
    const onSelectUser = async(evt) => {

        let user = JSON.parse(evt.target.value);
        const {
            data: { balance },
        } = await server.get(`dbalance/${user.address}`);
        setDbalance(balance);
        setUser(user);

    };

    useEffect(() => {
        (async () => {
            let {data : {wallets} } = await server.get(`wallets`);
            setWallets(wallets);
        })();
    },[]);

  return (
    <div className="container wallet">
        <h1>Wallet Address</h1>
        <select onChange={onSelectUser} value={user}>
            <option value="">--- please choose a user wallet ---</option>
                {wallets.map((u, i) => (
                    <option key={i} value={JSON.stringify(u)}>
                        {u.name}
                    </option>
            ))}
        </select>
        {
            user && (
                <>
                    <div className="balance">Address: {user.address.slice(-20).toUpperCase()}</div>
                    <div className="balance">Balance: {dbalance}</div>
                </>
            )
        }
    </div>
  );
}

export default Dwallet;
