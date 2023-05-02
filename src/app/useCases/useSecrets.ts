import { useCallback, useEffect, useState } from 'react';
import naclUtil from 'tweetnacl-util';
import nacl from 'tweetnacl';
import { Transaction } from './useStore';
import { sha3_256 } from 'js-sha3';
import { BLOCKS_UNTIL_NEW_SERIES } from '../utils/constants';

export interface KeyPairB64 {
  publicKey: string;
  secretKey: string;
}

export const decodeBase64 = (base64Input: string): Uint8Array => {
  return naclUtil.decodeBase64(base64Input);
};

export const signTransaction = (
  to: string,
  memo: string,
  tipHeight: number,
  keyPair: KeyPairB64,
) => {
  const transaction: Transaction = {
    time: Math.floor(Date.now() / 1000),
    nonce: Math.floor(Math.random() * (2 ** 31 - 1)),
    from: keyPair.publicKey,
    to,
    memo,
    series: Math.floor(tipHeight / BLOCKS_UNTIL_NEW_SERIES) + 1,
  };

  // optional protocol fields = ['from', 'memo', 'matures', 'expires', 'signature'];

  const tx_hash = sha3_256(JSON.stringify(transaction));

  const tx_byte = new Uint8Array(
    (tx_hash.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
  );

  transaction.signature = naclUtil.encodeBase64(
    nacl.sign.detached(tx_byte, naclUtil.decodeBase64(keyPair.secretKey)),
  );
  return transaction;
};

//TODO: encrypt keys with password
//TODO: Dont pass around secretKey in plain text
//only decrypt at rest/point of usage
export const useSecrets = () => {
  //TODO: Consider Zustand useState instead
  const [keyPair, setKeyPair] = useState<KeyPairB64>();

  const importKeyPairB64 = (publickKey: string, secretKey: string) => {
    let secret, error;

    try {
      secret = nacl.sign.keyPair.fromSecretKey(
        naclUtil.decodeBase64(secretKey),
      );
    } catch (err) {
      console.log(err);
      error = err;
    }

    if (!secret?.publicKey || !secret.secretKey || error) return;

    const keypair = {
      publicKey: naclUtil.encodeBase64(secret?.publicKey),
      secretKey: naclUtil.encodeBase64(secret?.secretKey),
    };

    if (publickKey !== keyPair?.publicKey) {
      console.log('publick key does not match secret key');
    }

    localStorage.setItem('default-account', JSON.stringify(keypair));

    loadKeyPair();
  };

  const generateKeyPairB64 = () => {
    const { publicKey, secretKey } = nacl.sign.keyPair();

    const keypair = {
      publicKey: naclUtil.encodeBase64(publicKey),
      secretKey: naclUtil.encodeBase64(secretKey),
    };

    localStorage.setItem('default-account', JSON.stringify(keypair));

    loadKeyPair();
  };

  const deleteKeyPair = () => {
    localStorage.removeItem('default-account');
    setKeyPair(undefined);
  };

  const loadKeyPair = useCallback(async () => {
    const value = localStorage.getItem('default-account');
    if (!!value) {
      setKeyPair(JSON.parse(value));
    } else {
      setKeyPair(undefined);
    }
  }, [setKeyPair]);

  useEffect(() => {
    if (!keyPair) {
      loadKeyPair();
    }
  }, [keyPair, loadKeyPair]);

  return {
    keyPairB64: keyPair,
    generateKeyPairB64,
    importKeyPairB64,
    deleteKeyPair,
  };
};
