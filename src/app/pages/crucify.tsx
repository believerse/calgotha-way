import { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
  IonToast,
  useIonModal,
} from '@ionic/react';
import { PageShell } from '../components/pageShell';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useP2P } from '../useCases/useP2P';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';

const Crucify = () => {
  const [offender, setOffender] = useState<string>('');
  const [charge, setCharge] = useState<string>('');

  const { pushTransaction, pushTransactionResult } = useP2P();

  const execute = () => {
    //Todo: client side validation
    pushTransaction(offender, charge);
  };

  const [isOpen, setIsOpen] = useState(true);

  const [present, dismiss] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismiss(data),
  });

  return (
    <PageShell
      title="Crucify"
      renderBody={() => (
        <>
          {pushTransactionResult && (
            <IonToast
              isOpen={isOpen}
              message={
                pushTransactionResult.error ||
                `Crucifixion: ${pushTransactionResult.transaction_id} was executed`
              }
              onDidDismiss={() => setIsOpen(false)}
              duration={5000}
            />
          )}
          <button
            onClick={() => {
              present({
                onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                  setOffender(ev.detail.data);
                },
              });
            }}
          >
            Scan QR Code
          </button>
          <IonList>
            <IonItem>
              <IonInput
                label="Cross bearer / Offender"
                labelPlacement="stacked"
                clearInput={true}
                placeholder="xxx-xxx-xxxx-xxxx-xxxx"
                value={offender}
                type="text"
                onIonInput={(event) =>
                  setOffender(event.target.value?.toString() ?? '')
                }
              />
            </IonItem>

            <IonItem>
              <IonTextarea
                label="Head sign / Charge"
                labelPlacement="stacked"
                counter={true}
                maxlength={140}
                value={charge}
                onIonInput={(event) => setCharge(event.target.value ?? '')}
              />
            </IonItem>
          </IonList>

          <IonButton
            expand="full"
            onClick={execute}
            class="ion-padding ion-no-margin"
          >
            Crucify
          </IonButton>
        </>
      )}
    />
  );
};

export default Crucify;

export const ScanQR = ({
  onDismiss,
}: {
  onDismiss: (decodedText?: string) => void;
}) => {
  const onNewScanResult = (decodedText: string, decodedResult: any) => {
    console.log(decodedResult);
    //Todo: validate scan result is valid public key
    onDismiss(decodedText);
  };
  return (
    <PageShell
      title="Scan QR Code"
      tools={[{ label: 'Cancel', action: onDismiss }]}
      renderBody={() => (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Scan</IonCardTitle>
            <IonCardSubtitle>QR Code</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <Html5QrcodePlugin
              fps={10}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={onNewScanResult}
            />
          </IonCardContent>
        </IonCard>
      )}
    />
  );
};