const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');


app.use(cors());
app.use(express.json());

const balances = {
  "03c67b7246afbf870f67b20fe5f639a9633f0ec8c570ed3da10481d9d24f04467a": 100,
  "0xe8692d0b2b6efb8b3fa0e0684c30c200d5e15b0e": 50,
  "0x5d9d18610946d83fce5c425579726894d02482b9": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, msg, signature } = req.body;
  const { amount, recipient } = msg;
  console.log("sender", sender)
  
  const sig = {
    ...signature,
    r: BigInt(signature.r),
    s: BigInt(signature.s)
  }


  setInitialBalance(sender);
  setInitialBalance(recipient);

  const hashMessage = (message) => keccak256(Uint8Array.from(message));


  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender) === true;

  if (!isValid) res.status(400).send({ message: "Invalid signature!" });


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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
