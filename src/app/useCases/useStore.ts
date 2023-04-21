import { create } from 'zustand';

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

export interface Block extends BlockIdHeaderPair {
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
  pushBlocks: (blocks?: Block[]) => void;
  getTransactions: () => Transaction[];
  tipHeader?: BlockIdHeaderPair;
  setTipHeader: (tipHeader: BlockIdHeaderPair) => void;
}

export const useFieldStore = create<FieldState>()((set, get) => ({
  blocksById: {},
  pushBlocks: (blocks = []) =>
    set((state) => ({
      blocksById: {
        ...state.blocksById,
        ...blocks.reduce((p, c) => ({ ...p, [c.block_id]: c }), {}),
      },
    })),
  getTransactions: () => {
    return Object.values(get().blocksById).flatMap(
      (block) => block?.transactions ?? [],
    );
  },
  tipHeader: undefined,
  setTipHeader: (tipHeader) => set({ tipHeader }),
}));

interface HeartState {
  blocksByPubKey: { [pubKey: string]: Block[] | null | undefined };
  pushBlocks: (publicKey: string, blocks?: Block[]) => void;
  getTransactions: (pubKey: string) => Transaction[];
  balancesByPubKey: { [pubKey: string]: Balance | null | undefined };
  getBalance: (pubKey: string) => Balance | null | undefined;
  setBalance: (balance: Balance) => void;
}

export const useHeartStore = create<HeartState>()((set, get) => ({
  blocksByPubKey: {},
  pushBlocks: (publicKey, blocks = []) =>
    set((state) => ({
      blocksByPubKey: {
        ...state.blocksByPubKey,
        [publicKey]: [...(state.blocksByPubKey[publicKey] ?? []), ...blocks],
      },
    })),
  getTransactions: (pubKey: string) =>
    get().blocksByPubKey[pubKey]?.flatMap((b) => b.transactions) ?? [],
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
