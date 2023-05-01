import { useEffect } from 'react';
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
  useIonModal,
  useIonToast,
} from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import ConnectionStatus from '../components/connectionStatus';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useP2P } from '../useCases/useP2P';
import { useInputValidationProps } from '../useCases/useInputValidation';
import { ReadyState } from 'react-use-websocket';

const Crucify = () => {
  const {
    value: offender,
    onBlur: onBlurOffender,
    isValid: isOffenderValid,
    isTouched: isOffenderTouched,
    onInputChange: setOffender,
  } = useInputValidationProps((offender: string) =>
    new RegExp('[A-Za-z0-9/+]{43}=').test(offender),
  );

  const {
    value: charge,
    onBlur: onBlurCharge,
    isValid: isChargeValid,
    isTouched: isChargeTouched,
    onInputChange: setCharge,
  } = useInputValidationProps(
    (charge: string) => charge.length > 0 || charge.length <= 140,
  );

  const { readyState, getTipHeader, pushTransaction } = useP2P();

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      getTipHeader();
    }
  }, [readyState, getTipHeader]);

  const execute = () => {
    if (!isOffenderValid || !isChargeValid) {
      return;
    }
    pushTransaction(offender, charge);
  };

  const [presentScanner, dismissScanner] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismissScanner(data),
  });

  const [presentToast] = useIonToast();

  useEffect(() => {
    const pushResultHandler = (data: any) =>
      presentToast({
        message:
          data.detail.error ||
          `Crucifixion: ${data.detail.transaction_id} was executed`,
        duration: 5000,
        position: 'bottom',
      });

    document.addEventListener('push_transaction_result', pushResultHandler);

    return () => {
      document.removeEventListener(
        'push_transaction_result',
        pushResultHandler,
      );
    };
  }, [presentToast]);

  return (
    <PageShell
      title="Crucify"
      renderBody={() => (
        <>
          <ConnectionStatus readyState={readyState} />
          <button
            onClick={() => {
              presentScanner({
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
                className={`${isOffenderValid && 'ion-valid'} ${
                  isOffenderValid === false && 'ion-invalid'
                } ${isOffenderTouched && 'ion-touched'}`}
                label="Cross bearer / Offender"
                labelPlacement="stacked"
                clearInput={true}
                errorText="Invalid public key"
                value={offender}
                type="text"
                onIonBlur={onBlurOffender}
                onIonInput={(event) =>
                  setOffender(event.target.value?.toString() ?? '')
                }
              />
            </IonItem>

            <IonItem>
              <IonTextarea
                className={`${isChargeValid && 'ion-valid'} ${
                  isChargeValid === false && 'ion-invalid'
                } ${isChargeTouched && 'ion-touched'}`}
                label="Head sign / Charge"
                labelPlacement="stacked"
                counter={true}
                maxlength={140}
                value={charge}
                onIonBlur={onBlurCharge}
                onIonInput={(event) => setCharge(event.target.value ?? '')}
              />
            </IonItem>
          </IonList>

          <IonButton
            disabled={!isOffenderValid || !isChargeValid}
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
