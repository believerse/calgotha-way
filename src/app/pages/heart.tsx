import { IonButton, IonText } from '@ionic/react';
import { PageShell } from '../components/pageShell';
import QRCode from 'react-qr-code';
import { useP2P } from '../useCases/useP2P';
import { useSecrets } from '../useCases/useSecrets';
import { CrucifixionList } from '../components/crucifixion';
import exportFromJSON from 'export-from-json';
import { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';

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

  return (
    <PageShell
      title="Heart"
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
              <div
                style={{
                  height: 'auto',
                  margin: '0 auto',
                  maxWidth: 200,
                  width: '100%',
                }}
              >
                <QRCode
                  id="QRCode"
                  size={256}
                  style={{
                    background: 'white',
                    padding: '8px',
                    height: 'auto',
                    maxWidth: '100%',
                    width: '100%',
                  }}
                  value={publicKey}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <IonText color="warning">{publicKey}</IonText>
              <IonButton strong={true} onClick={exportKeys}>
                Export keypair
              </IonButton>

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
                  heading="My Crucifixions"
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
