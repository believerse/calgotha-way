import { useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import { NODE_STRING, GENESIS_BLOCK_ID } from '../utils/constants';
import { useFieldStore, useHeartStore } from './useStore';
import { signTransaction, useSecrets } from './useSecrets';

export const useP2P = () => {
  const { keyPairB64 } = useSecrets();

  const tipHeader = useFieldStore((state) => state.tipHeader);
  const setTipHeader = useFieldStore((state) => state.setTipHeader);

  const getBlockIdByHeight = useFieldStore((state) => state.getBlockIdByHeight);

  const fieldTransactions = useFieldStore((state) => state.getTransactions);
  const appendFieldBlock = useFieldStore((state) => state.appendBlock);

  const balance = useHeartStore((state) => state.getBalance);
  const setBalance = useHeartStore((state) => state.setBalance);
  const heartTransactions = useHeartStore((state) => state.getTransactions);
  const appendHeartBlocks = useHeartStore((state) => state.appendBlocks);

  const { sendJsonMessage, readyState } = useWebSocket(
    `wss://${NODE_STRING}/${GENESIS_BLOCK_ID}`,
    {
      protocols: ['cruzbit.1'],
      onOpen: () => console.log('opened'),
      shouldReconnect: () => true,
      share: true,
      onMessage: (event) => {
        const { type, body } = JSON.parse(event.data);

        switch (type) {
          case 'inv_block':
            //Todo: dispatch event for new block
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
            document.dispatchEvent(
              new CustomEvent<{
                transaction_id: string;
                error: string;
              }>('push_transaction_result', { detail: body }),
            );
            break;
          case 'public_key_transactions':
            appendHeartBlocks(body.public_key, body.filter_blocks ?? []);
            break;
        }
      },
    },
  );

  const getBlockById = (block_id: string) => {
    //TODO: skip if exists in cache
    sendJsonMessage({
      type: 'get_block',
      body: { block_id },
    });
  };

  const getBlockByHeight = useCallback(
    (height: number) => {
      if (!!getBlockIdByHeight(height)) return;
      sendJsonMessage({
        type: 'get_block_by_height',
        body: { height },
      });
    },
    [sendJsonMessage, getBlockIdByHeight],
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

      //TODO: skip if exists in cache

      if (tipHeader?.header.height) {
        sendJsonMessage({
          type: 'get_public_key_transactions',
          body: {
            public_key: publicKeyB64,
            start_height: tipHeader?.header.height,
            end_height: 0,
            limit: 100,
          },
        });
      }
    },
    [sendJsonMessage, tipHeader],
  );

  return {
    readyState,
    getBlockById,
    tipHeader,
    getTipHeader,
    balance,
    getBalance,
    applyFilter,
    pushTransaction,
    fieldTransactions,
    getHeartTransactions,
    heartTransactions,
    getBlockByHeight,
  };
};
