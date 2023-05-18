const express = require("express");
const app = express();
const cors = require("cors");
const secp = require('@noble/secp256k1');
const { keccak256 } = require("ethereum-cryptography/keccak");
const {toHex} = require("ethereum-cryptography/utils");
const port = 3043;

app.use(cors());
app.use(express.json());

let wallets = [
  {
    "name":"bob",
    "balance":25,
    "address":"c2b9120a32fa12032024c3c8c6f9eb4de528a104",
  },
  {
    "name":"alice",
    "balance":50,
    "address":"074adc4a6721df189832848b5876741466c466c0",
  },
  {
    "name":"charles",
    "balance":75,
    "address":"8751bc70aaba1ef2180127cc3c781f4cfa8168ab",
  },
];

const privateKeys = {
	'c2b9120a32fa12032024c3c8c6f9eb4de528a104':'b6f290d3f99cc10c1a3ed302abd63da3638e63ae0e10b3adbc4220a33efaed29',
	'074adc4a6721df189832848b5876741466c466c0':'1de28e7cbc345523ce376015bccf6b21662cf749c93687dfda1a4d1f86baa824',
	'814ebaa63a20287d6ad8552699743cd535085d27':'0b922ee80956962f0580678ce5b8786551e9008efb8b8ea69f60b9cdfa7249ed'
}

const balances = {
  "03faacecc821980ad79eb079b654bf2bdd515812a09589cbb686894edf5a42fb36": 100,
  "02be9959e00870053cc91d0435661bd0c128b7368e8e720fb95e8521bcc0a6ee70": 50,
  "02ac58f59a86dbe0f5d317afea4c433d945365a6d802fe477f791a79a6ae04d2ea": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/dbalance/:address", (req, res) => {
  const { address } = req.params;
  let foundAddress = wallets.filter((user) => user.address === address );
  const balance = foundAddress[0]['balance'] || 0;
  res.send({ balance });
});

app.get("/wallets", (req, res) => {
  res.send({ wallets });
});

app.get("/keys", (req, res) => {
  res.send({ privateKeys });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.post("/dsend", (req, res) => {
	
  const { recipient, amount, signature, txHash } = req.body;

	const [sign, recBit] = signature;
	const signed = new Uint8Array(Object.values(sign));
	const hash = new Uint8Array(Object.values(txHash));
	const pubKey = secp.recoverPublicKey(hash, signed, recBit);
  const address = toHex(keccak256(pubKey.slice(1)).slice(-20));

  let message =false,balance=0;
  let modified = wallets.map((wallet) => {
    let item = wallet;
    if (!message) {
      if (wallet.address === address){
        if (wallet.balance < amount) {
          message = "Not enough funds!";
        } else {
          item['balance'] -= amount;
          balance = item['balance'];
        }
      }
      if (wallet.address === recipient ) {
        item['balance'] += amount;
      }
    }
    return item;
  });
  wallets = modified;
  if (message){
    res.status(400).send({ message});
  } else {
    res.send({ balance });
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
