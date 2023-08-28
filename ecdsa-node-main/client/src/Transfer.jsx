import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import * as secp from "ethereum-cryptography/secp256k1";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = (message) => {
    return keccak256(utf8ToBytes(message))
  }
  const signMessage = (msg) => {
    return secp256k1.sign(msg, privateKey)
  }

  async function transfer(evt) {
    evt.preventDefault();

    const msg = hashMessage(sendAmount, recipient)
    const signature = signMessage(msg)

    const stringifyBigInts = obj => {
      for (let prop in obj) {
        let value = obj[prop];
        if (typeof value === 'bigint') {
          obj[prop] = value.toString();
        } else if (typeof value === 'object' && value !== null) {
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    }

    // stringify bigints before sending to server
    const signatureStringed = stringifyBigInts(signature);


    try {
      const response = await server.post(`send`, {
        address,
        msg,
        signatureStringed,
      });
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      const { balance } = response.data;
      setBalance(balance);
    } catch (ex) {
      alert(ex.response ? ex.response.data.message : ex.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
