import naclUtil from 'tweetnacl-util';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { Transaction } from '../useCases/useStore';
import { sha3_256 } from 'js-sha3';
import { BLOCKS_UNTIL_NEW_SERIES } from './constants';
import { decryptData, encryptData } from './encryption';

window.Buffer = window.Buffer || require('buffer').Buffer;

export const generateMnemonic = () => {
  return bip39.generateMnemonic();
};

export const getKeyChain = async (passphrase: string, count: number) => {
  const encryptedMnemonic = localStorage.getItem('default-keychain');

  if (!encryptedMnemonic) return [];

  const decryptedMnemonicBytes = await decryptData(
    encryptedMnemonic,
    passphrase,
  );

  if (!decryptedMnemonicBytes) {
    console.log('Failed to decrypt the mnemonic.');
    return [];
  }

  const decryptedMnemonic = new TextDecoder().decode(decryptedMnemonicBytes);

  const seed = bip39.mnemonicToSeedSync(decryptedMnemonic, passphrase);
  const keypairs = [];

  for (let i = 0; i < count; i++) {
    const derivedSeed = nacl.hash(
      Buffer.concat([seed, Buffer.from(String(i), 'utf-8')]),
    );
    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed.slice(0, 32));
    keypairs.push({
      publicKey: naclUtil.encodeBase64(keyPair.publicKey),
      privateKey: keyPair.secretKey,
    });
  }

  return keypairs;
};

export const signTransaction = async (
  to: string,
  memo: string,
  tipHeight: number,
  keyChainIndex: number,
  passPhrase: string,
) => {
  //Prompt -> Sign -> Forget
  //We never persist the passphrase or private keys in state or anywhere else.
  //Any usage of the private keys must require a user prompt for their passphrase.

  const keychain = await getKeyChain(passPhrase, Number(keyChainIndex + 1));

  const keyPair = keychain[keyChainIndex];

  const transaction: Transaction = {
    time: Math.floor(Date.now() / 1000),
    nonce: Math.floor(Math.random() * (2 ** 31 - 1)),
    from: keyPair.publicKey,
    to,
    memo,
    series: Math.floor(tipHeight / BLOCKS_UNTIL_NEW_SERIES) + 1,
  };

  const tx_hash = sha3_256(JSON.stringify(transaction));

  const tx_byte = new Uint8Array(
    (tx_hash.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
  );

  transaction.signature = naclUtil.encodeBase64(
    nacl.sign.detached(tx_byte, keyPair.privateKey),
  );
  return transaction;
};

export const importMnemonic = async (
  mnemonicPhrase: string,
  passPhrase: string,
  returnKeyCount: number = 3,
) => {
  const encryptedMnemonic = await encryptData(
    new TextEncoder().encode(mnemonicPhrase.trim()),
    passPhrase,
  );
  localStorage.setItem('default-keychain', encryptedMnemonic);

  //We can keep the public keys in state
  //But we never persist the passphrase or private keys in state or anywhere else.
  return (await getKeyChain(passPhrase, returnKeyCount)).map(
    (keypair) => keypair.publicKey,
  );
};

export const deleteKeyChain = () => {
  localStorage.removeItem('default-keychain');
};
