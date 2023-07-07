import ConnectionStatus from '../components/connectionStatus';
import { CrucifixionList } from '../components/crucifixion';
import { PageShell } from '../components/pageShell';
import { useP2P } from '../useCases/useP2P';
import { useEffect } from 'react';
import { IonButton, IonItem, IonLabel } from '@ionic/react';
import { usePagination } from 'react-use-pagination';

const Field = () => {
  const { readyState, tipHeader, getBlockByHeight, fieldTransactions } =
    useP2P();

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
    //when pagination page changes
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
            <IonItem lines="none" className="ion-justify-content-between">
              <IonButton
                size="small"
                onClick={() => setPage(0)}
                disabled={currentPage === 0}
              >
                Genesis
              </IonButton>
              <IonButton
                size="small"
                onClick={() => setPreviousPage()}
                disabled={!previousEnabled}
              >
                Prev
              </IonButton>
              <IonLabel className="ion-text-center">
                {currentPage + 1} of {totalPages}
              </IonLabel>
              <IonButton
                size="small"
                onClick={() => setNextPage()}
                disabled={!nextEnabled}
              >
                Next
              </IonButton>
              <IonButton
                size="small"
                onClick={() => setPage(tipHeight + 1)}
                disabled={currentPage + 1 === tipHeight + 1}
              >
                Latest
              </IonButton>
            </IonItem>
          )}
          <CrucifixionList crucifixions={fieldTransactions(currentPage)} />
        </>
      )}
    />
  );
};

export default Field;
