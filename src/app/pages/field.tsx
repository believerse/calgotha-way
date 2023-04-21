import { ReadyState } from 'react-use-websocket';
import ConnectionStatus from '../components/connectionStatus';
import { CrucifixionList } from '../components/crucifixion';
import { PageShell } from '../components/pageShell';
import { useP2P } from '../useCases/useP2P';
import { useIonViewDidEnter } from '@ionic/react';

const Field = () => {
  const { readyState, getTipHeader, fieldTransactions } = useP2P();

  useIonViewDidEnter(() => {
    if (readyState === ReadyState.OPEN) {
      getTipHeader();
    }
  });

  return (
    <PageShell
      title="Field"
      renderBody={() => (
        <>
          <ConnectionStatus readyState={readyState} />
          <CrucifixionList crucifixions={fieldTransactions()} />
        </>
      )}
    />
  );
};

export default Field;
