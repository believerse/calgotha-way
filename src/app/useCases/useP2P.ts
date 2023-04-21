import { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { PEER_STRING, GENESIS_BLOCK_ID } from '../utils/constants';
import { useFieldStore, useHeartStore } from './useStore';
import { signTransaction, useSecrets } from './useSecrets';

export const useP2P = () => {
  const { keyPairB64 } = useSecrets();

  const [pushTransactionResult, setPushTxResult] = useState<{
    transaction_id: string;
    error: string;
  }>();

  const tipHeader = useFieldStore((state) => state.tipHeader);
  const setTipHeader = useFieldStore((state) => state.setTipHeader);

  const fieldTransactions = useFieldStore((state) => state.getTransactions);
  const pushFieldBlocks = useFieldStore((state) => state.pushBlocks);

  const balance = useHeartStore((state) => state.getBalance);
  const setBalance = useHeartStore((state) => state.setBalance);
  const heartTransactions = useHeartStore((state) => state.getTransactions);
  const pushHeartBlocks = useHeartStore((state) => state.pushBlocks);

  const { sendJsonMessage, readyState } = useWebSocket(
    `wss://${PEER_STRING}/${GENESIS_BLOCK_ID}`,
    {
      protocols: ['cruzbit.1'],
      onOpen: () => console.log('opened'),
      shouldReconnect: () => true,
      share: true,
      onMessage: (event) => {
        const { type, body } = JSON.parse(event.data);

        switch (type) {
          case 'inv_block':
            body.block_ids.forEach((block_id: string) => {
              getBlock(block_id);
            });
            break;
          case 'tip_header':
            setTipHeader(body);
            getBlock(body.block_id);
            //Todo: get earlier blocks using getByHeight()
            break;
          case 'balance':
            setBalance(body);
            break;
          case 'block':
            pushFieldBlocks([body.block]);
            break;
          case 'push_transaction_result':
            setPushTxResult(body);
            break;
          case 'public_key_transactions':
            pushHeartBlocks(body.public_key, body.filter_blocks ?? []);
            break;
        }
      },
    },
  );

  const getBlock = (block_id: string) => {
    sendJsonMessage({
      type: 'get_block',
      body: { block_id },
    });
  };

  const getTipHeader = () => {
    sendJsonMessage({ type: 'get_tip_header' });
  };

  const applyFilter = (publicKeysB64: string[]) => {
    if (publicKeysB64.length) {
      sendJsonMessage({
        type: 'filter_add',
        body: {
          public_keys: publicKeysB64,
        },
      });
    }
  };

  const getBalance = (publicKeyB64: string) => {
    if (!publicKeyB64) throw new Error('missing publicKey');

    sendJsonMessage({
      type: 'get_balance',
      body: {
        public_key: publicKeyB64,
      },
    });
  };

  const pushTransaction = (to: string, memo: string) => {
    setPushTxResult(undefined);

    if (to && memo && tipHeader?.header.height && keyPairB64) {
      const transaction = signTransaction(
        to,
        memo,
        tipHeader?.header.height,
        keyPairB64,
      );

      if (!transaction) return;

      sendJsonMessage({
        type: 'push_transaction',
        body: {
          transaction,
        } as any,
      });
    }
  };

  const getHeartTransactions = (publicKeyB64: string) => {
    if (!publicKeyB64) throw new Error('missing publicKey');

    if (tipHeader?.header.height) {
      sendJsonMessage({
        type: 'get_public_key_transactions',
        body: {
          public_key: publicKeyB64,
          start_height: tipHeader?.header.height + 1,
          end_height: 0,
          limit: 10,
        },
      });
    }
  };

  return {
    readyState,
    getBlock,
    tipHeader,
    getTipHeader,
    balance,
    getBalance,
    applyFilter,
    pushTransaction,
    pushTransactionResult,
    fieldTransactions,
    getHeartTransactions,
    heartTransactions,
  };
};
