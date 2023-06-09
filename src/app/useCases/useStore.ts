import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Balance {
  public_key: string;
  balance: number;
  block_id?: string;
  height?: number;
  error?: string;
}

export interface BlockHeader {
  previous: string;
  hash_list_root: string;
  time: number;
  target: string;
  chain_work: string;
  nonce: number;
  height: number;
  transaction_count: number;
}

export interface BlockIdHeaderPair {
  block_id: string;
  header: BlockHeader;
}

export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
}

export interface Transaction {
  from: string;
  to: string;
  memo: string;
  time: number;
  nonce?: number;
  series?: number;
  signature?: string;
}

interface FieldState {
  blocksById: { [blockId: string]: Block | null | undefined };
  blockIdsByHeight: { [height: number]: string };
  appendBlock: (block_id: string, block: Block) => void;
  getBlockIdByHeight: (height: number) => string;
  getTransactions: (height: number) => Transaction[];
  tipHeader?: BlockIdHeaderPair;
  setTipHeader: (tipHeader: BlockIdHeaderPair) => void;
}

export const useFieldStore = create<FieldState>()((set, get) => ({
  blocksById: {},
  blockIdsByHeight: {},
  appendBlock: (block_id, block) =>
    set((state) => ({
      blocksById: {
        ...state.blocksById,
        [block_id]: block,
      },
      blockIdsByHeight: {
        ...state.blockIdsByHeight,
        [block.header.height]: block_id,
      },
    })),
  getBlockIdByHeight: (height) => {
    const block_id = get().blockIdsByHeight[height];
    return block_id;
  },
  getTransactions: (height) => {
    const block_id = get().blockIdsByHeight[height];
    return get().blocksById[block_id]?.transactions ?? [];
  },
  tipHeader: undefined,
  setTipHeader: (tipHeader) => set({ tipHeader }),
}));

interface HeartState {
  transactionsByPubKey: { [pubKey: string]: Transaction[] | null | undefined };
  appendBlocks: (publicKey: string, blocks?: Block[]) => void;
  getTransactions: (pubKey: string) => Transaction[];
  balancesByPubKey: { [pubKey: string]: Balance | null | undefined };
  getBalance: (pubKey: string) => Balance | null | undefined;
  setBalance: (balance: Balance) => void;
}

export const useHeartStore = create<HeartState>()((set, get) => ({
  transactionsByPubKey: {},
  appendBlocks: (publicKey, blocks = []) => {
    const transactions = blocks.flatMap((i) => i.transactions);
    set((state) => ({
      transactionsByPubKey: {
        ...state.transactionsByPubKey,
        [publicKey]: [
          ...new Map(
            [
              ...(state.transactionsByPubKey[publicKey] ?? []),
              ...transactions,
            ].map((item) => [item['time'], item]),
          ).values(),
        ],
      },
    }));
  },
  getTransactions: (pubKey: string) => get().transactionsByPubKey[pubKey] ?? [],
  balancesByPubKey: {},
  getBalance: (pubKey: string) => get().balancesByPubKey[pubKey],
  setBalance: (balance) =>
    set((state) => ({
      balancesByPubKey: {
        ...state.balancesByPubKey,
        [balance.public_key]: balance,
      },
    })),
}));

interface KeyState {
  publicKeys: string[];
  setPublicKeys: (keys: string[]) => void;
}

export const useKeyStore = create<KeyState>()(
  persist(
    (set, get) => ({
      publicKeys: [],
      setPublicKeys: (keys) => {
        set(() => ({
          publicKeys: keys,
        }));
      },
    }),
    {
      name: 'key-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
