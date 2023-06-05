import useWebSocket from 'react-use-websocket';
import { INDEXER_STRING } from '../utils/constants';
import { useState } from 'react';

interface RankResult {
  [public_key: string]: number;
}

export const useIndexer = () => {
  const [rankings, setRankings] = useState<RankResult>({});

  const { readyState } = useWebSocket(`wss://${INDEXER_STRING}`, {
    onOpen: () => console.log('indexer opened'),
    shouldReconnect: () => true,
    share: true,
    onMessage: (event) => {
      const { type, body } = JSON.parse(event.data);

      switch (type) {
        case 'rank_result':
          console.log('result', body);
          const { rankResults } = body;
          setRankings(rankResults);
          break;
      }
    },
  });

  const getRankFor = (public_key: string) => {
    return rankings[public_key];
  };

  return {
    readyState,
    getRankFor,
  };
};
