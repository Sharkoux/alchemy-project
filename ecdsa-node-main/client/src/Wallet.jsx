import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKeys = evt.target.value;
    setPrivateKey(privateKeys);
    const publicKey = secp256k1.getPublicKey(privateKeys);
    setAddress(toHex(publicKey));
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type your private Key" value={privateKey} onChange={onChange}></input>
      </label>
      <div>Address:  {address.slice(0, 10)}...</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
