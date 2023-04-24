import { ReadyState } from 'react-use-websocket';
import ConnectionStatus from '../components/connectionStatus';
import { CrucifixionList } from '../components/crucifixion';
import { PageShell } from '../components/pageShell';
import { useP2P } from '../useCases/useP2P';
import { useEffect } from 'react';
import { IonLabel } from '@ionic/react';
import { usePagination } from 'react-use-pagination';

const Field = () => {
  const {
    readyState,
    tipHeader,
    getTipHeader,
    getBlockByHeight,
    fieldTransactions,
  } = useP2P();

  const tipHeight = tipHeader?.header.height ?? 0;

  const {
    currentPage,
    totalPages,
    setNextPage,
    setPreviousPage,
    nextEnabled,
    previousEnabled,
  } = usePagination({
    totalItems: tipHeight,
    initialPage: tipHeight,
    initialPageSize: 1,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      getTipHeader();
    }
  }, [tipHeight, readyState]);

  return (
    <PageShell
      title="Field"
      renderBody={() => (
        <>
          <ConnectionStatus readyState={readyState} />
          <button
            onClick={() => {
              getBlockByHeight(currentPage - 1);
              setPreviousPage();
            }}
            disabled={!previousEnabled}
          >
            Prev
          </button>
          <IonLabel>
            {currentPage} of {totalPages}
          </IonLabel>
          <button
            onClick={() => {
              getBlockByHeight(currentPage + 1);
              setNextPage();
            }}
            disabled={!nextEnabled}
          >
            Next
          </button>
          <CrucifixionList crucifixions={fieldTransactions(currentPage)} />
        </>
      )}
    />
  );
};

export default Field;
