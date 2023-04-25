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
    setPage,
    nextEnabled,
    previousEnabled,
  } = usePagination({
    totalItems: tipHeight + 1,
    initialPage: tipHeight,
    initialPageSize: 1,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      getTipHeader();
    }
  }, [readyState, getTipHeader]);

  useEffect(() => {
    if (tipHeight > 0) {
      getBlockByHeight(currentPage);
    }
  }, [currentPage, tipHeight, getBlockByHeight]);

  return (
    <PageShell
      title="Field"
      renderBody={() => (
        <>
          <ConnectionStatus readyState={readyState} />
          {!!tipHeight && (
            <>
              <button onClick={() => setPage(0)} disabled={currentPage === 0}>
                Genesis
              </button>
              <button
                onClick={() => setPreviousPage()}
                disabled={!previousEnabled}
              >
                Prev
              </button>
              <IonLabel>
                {currentPage + 1} of {totalPages}
              </IonLabel>
              <button onClick={() => setNextPage()} disabled={!nextEnabled}>
                Next
              </button>
              <button
                onClick={() => setPage(tipHeight + 1)}
                disabled={currentPage + 1 === tipHeight + 1}
              >
                Latest
              </button>
            </>
          )}
          <CrucifixionList crucifixions={fieldTransactions(currentPage)} />
        </>
      )}
    />
  );
};

export default Field;
