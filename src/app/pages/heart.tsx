import { IonIcon, IonText, useIonActionSheet } from '@ionic/react';
import { PageShell } from '../components/pageShell';
import { useP2P } from '../useCases/useP2P';
import { useKeyChain, generateSecretPhrase } from '../useCases/useKeyChain';
import { CrucifixionList } from '../components/crucifixion';
import { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import KeyViewer from '../components/keyViewer';
import { CreateAccount } from '../components/createAccount';
import { useIndexer } from '../useCases/useIndexer';
import { useClipboard } from '../useCases/useClipboard';

const Heart = () => {
  const { publicKeys, importKeyChain, deleteKeyChain } = useKeyChain();

  const {
    readyState,
    balance,
    getBalance,
    heartTransactions,
    getHeartTransactions,
  } = useP2P();

  const { getRankFor } = useIndexer();

  const publicKey = publicKeys[0];

  const transactions = heartTransactions(publicKey);

  const pubKeyBalance = balance(publicKey)?.balance;

  const { copyToClipboard } = useClipboard();

  useEffect(() => {
    if (readyState === ReadyState.OPEN && publicKey) {
      getBalance(publicKey);
      getHeartTransactions(publicKey);
    }
  }, [readyState, publicKey, getBalance, getHeartTransactions]);

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data, role }: OverlayEventDetail) => {
    if (data?.['action'] === 'delete') {
      deleteKeyChain();
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
                  text: 'Delete keychain',
                  role: 'destructive',
                  data: {
                    action: 'delete',
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
          {!publicKey && (
            <CreateAccount
              generateSecretPhrase={generateSecretPhrase}
              importKeychain={importKeyChain}
              copyPhrase={copyToClipboard}
            />
          )}
          {!!publicKey && (
            <>
              <KeyViewer value={publicKey} />
              {pubKeyBalance !== undefined && (
                <IonText color="primary">
                  <p>
                    <strong>Redemptive surplus: </strong>
                    <i>{pubKeyBalance}</i>
                  </p>
                </IonText>
              )}
              {getRankFor(publicKey) !== undefined && (
                <IonText color="primary">
                  <p>
                    <strong>Redemptive impact: </strong>
                    <i>
                      {Number((getRankFor(publicKey) / 1) * 100).toFixed(2)}%
                    </i>
                  </p>
                </IonText>
              )}
              {!!transactions && !!transactions.length && (
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
