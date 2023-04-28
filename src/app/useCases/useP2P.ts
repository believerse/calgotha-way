import { useCallback, useState } from 'react';
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

  const blockIdByHeight = useFieldStore((state) => state.blockIdsByHeight);

  const fieldTransactions = useFieldStore((state) => state.getTransactions);
  const appendFieldBlock = useFieldStore((state) => state.appendBlock);

  const balance = useHeartStore((state) => state.getBalance);
  const setBalance = useHeartStore((state) => state.setBalance);
  const heartTransactions = useHeartStore((state) => state.getTransactions);
  const appendHeartBlocks = useHeartStore((state) => state.appendBlocks);

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
            //Todo: show toast notification of new block
            body.block_ids.forEach((block_id: string) => {
              getBlockById(block_id);
            });
            break;
          case 'tip_header':
            setTipHeader(body);
            break;
          case 'balance':
            setBalance(body);
            break;
          case 'block':
            appendFieldBlock(body.block_id, body.block);
            break;
          case 'push_transaction_result':
            setPushTxResult(body);
            break;
          case 'public_key_transactions':
            appendHeartBlocks(body.public_key, body.filter_blocks ?? []);
            break;
        }
      },
    },
  );

  const getBlockById = (block_id: string) => {
    sendJsonMessage({
      type: 'get_block',
      body: { block_id },
    });
  };

  const getBlockByHeight = useCallback(
    (height: number) => {
      if (!!blockIdByHeight[height]) return;
      sendJsonMessage({
        type: 'get_block_by_height',
        body: { height },
      });
    },
    [sendJsonMessage, blockIdByHeight],
  );

  const getTipHeader = useCallback(() => {
    sendJsonMessage({ type: 'get_tip_header' });
  }, [sendJsonMessage]);

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

  const getBalance = useCallback(
    (publicKeyB64: string) => {
      if (!publicKeyB64) throw new Error('missing publicKey');

      sendJsonMessage({
        type: 'get_balance',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [sendJsonMessage],
  );

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

  const getHeartTransactions = useCallback(
    (publicKeyB64: string) => {
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
    },
    [sendJsonMessage, tipHeader],
  );

  return {
    readyState,
    getBlock: getBlockById,
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
    getBlockByHeight,
  };
};