import { IonButton, IonText, IonIcon, useIonActionSheet } from '@ionic/react';
import { PageShell } from '../components/pageShell';
import { useP2P } from '../useCases/useP2P';
import { useSecrets } from '../useCases/useSecrets';
import { CrucifixionList } from '../components/crucifixion';
import exportFromJSON from 'export-from-json';
import { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import KeyViewer from '../components/keyViewer';

const Heart = () => {
  const { keyPairB64, generateKeyPairB64 } = useSecrets();

  const publicKey = keyPairB64?.publicKey || '';
  const secretKey = keyPairB64?.secretKey || '';

  const {
    readyState,
    balance,
    getBalance,
    heartTransactions,
    getHeartTransactions,
  } = useP2P();

  const transactions = heartTransactions(publicKey);

  const pubKeyBalance = balance(publicKey)?.balance;

  const exportKeys = async () => {
    const data = { publicKey, secretKey };
    const fileName = 'download';
    const exportType = exportFromJSON.types.txt;

    exportFromJSON({ data, fileName, exportType });
  };

  useEffect(() => {
    if (readyState === ReadyState.OPEN && publicKey) {
      getBalance(publicKey);
      getHeartTransactions(publicKey);
    }
  }, [readyState, publicKey, getBalance, getHeartTransactions]);

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data, role }: OverlayEventDetail) => {
    if (data?.['action'] === 'export') {
      exportKeys();
    }
  };

  return (
    <PageShell
      title="Heart"
      tools={[
        {
          label: 'action sheet',
          renderIcon: () => (
            <IonIcon
              slot="icon-only"
              ios={ellipsisHorizontal}
              md={ellipsisVertical}
            ></IonIcon>
          ),
          action: () =>
            presentActionSheet({
              onDidDismiss: ({ detail }) => handleActionSheet(detail),
              header: 'Actions',
              buttons: [
                {
                  text: 'Delete keys',
                  role: 'destructive',
                  data: {
                    action: 'delete',
                  },
                },
                {
                  text: 'Export keys',
                  data: {
                    action: 'export',
                  },
                },
                {
                  text: 'Cancel',
                  role: 'cancel',
                  data: {
                    action: 'cancel',
                  },
                },
              ],
            }),
        },
      ]}
      renderBody={() => (
        <>
          <p>
            {!publicKey && (
              <>
                <IonButton strong={true} onClick={() => generateKeyPairB64()}>
                  Create new keypair
                </IonButton>

                <IonText color="danger">
                  No account keypair, create one to begin.
                </IonText>
              </>
            )}
          </p>
          {!!publicKey && (
            <>
              <KeyViewer value={publicKey} />
              {pubKeyBalance !== undefined && (
                <div className="container">
                  <strong>Balance</strong>
                  <p>
                    <i>{pubKeyBalance}</i>
                  </p>
                </div>
              )}
              {transactions && transactions.length && (
                <CrucifixionList
                  heading="My Crosses"
                  crucifixions={transactions}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Heart;
