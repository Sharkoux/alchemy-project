const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { hexToBytes } = require('ethereum-cryptography/utils');

//Private key: dc4fd57734d0010f5020b38db3dd9c3821d239db7418627fd47d7c4f3ac64aa1
//Public key: 03f95a790b0046472d72f0c59664a09a48f7e44bba4393d68697c780aec9d19dbb
//Address: 0xb9fa9bd3110f7f85246986df8deedc0deb6137f8   

//Private key: fed0b9c6569560d0da283c9d9f48470ea2a62e72fe3fa3b765ca3989330e4ce9
//Public key: 02ef5db4c53c93d8610f711a4b87b4ea4a65b95c4c281805946ea6c000dade1205
//Address: 0xc0c4c4c56737c4f0748898064d954b581710b319

//Private key: df863b3e9e50c0aa471672843e647fe47c82835354e50de1b766831f0fd10e95
//Public key: 03ae415c8b31226b7f8f41d80ae65eecbfef2d2cb16717491fefde07212d964b2f
//Address: 0xe2886b2e3c903594d38e425d214281b253efcf8b   

//If we want to use the address instead of the public key, the use of etherjs will be useful

app.use(cors());
app.use(express.json());

const balances = {
  "03f95a790b0046472d72f0c59664a09a48f7e44bba4393d68697c780aec9d19dbb": 100,
  "02ef5db4c53c93d8610f711a4b87b4ea4a65b95c4c281805946ea6c000dade1205": 50,
  "03ae415c8b31226b7f8f41d80ae65eecbfef2d2cb16717491fefde07212d964b2f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { address, recipient, amount, msgHashHex, signatureStringed } = req.body;

  const msgHash = hexToBytes(msgHashHex)

  const sig = {
    r: BigInt(signatureStringed.r),
    s: BigInt(signatureStringed.s),
    recovery: signatureStringed.recovery,
  }

  setInitialBalance(address);
  setInitialBalance(recipient);

  const isValid = secp.secp256k1.verify(sig, msgHash, address);

  if (!isValid) res.status(400).send({ message: "Invalid signature!" });


  if (balances[address] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[address] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[address] });
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
