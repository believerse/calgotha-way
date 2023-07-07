import { useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import { scanOutline } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import ConnectionStatus from '../components/connectionStatus';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useP2P } from '../useCases/useP2P';
import { useInputValidationProps } from '../useCases/useInputValidation';

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

  const {
    value: passphrase,
    onBlur: onBlurPassphrase,
    isValid: isPassphraseValid,
    isTouched: isPassphraseTouched,
    onInputChange: setPassphrase,
  } = useInputValidationProps((input: string) => input.length > 0);

  const { readyState, pushTransaction } = useP2P();

  const execute = () => {
    if (!isOffenderValid || !isChargeValid) {
      return;
    }
    pushTransaction(offender, charge, passphrase);
  };

  const [presentScanner, dismissScanner] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismissScanner(data),
  });

  const [presentToast] = useIonToast();

  useEffect(() => {
    const pushResultHandler = (data: any) => {
      presentToast({
        message:
          data.detail.error ||
          `Crucifixion: ${data.detail.transaction_id} was executed`,
        duration: 5000,
        position: 'bottom',
      });

      if (!data.detail.error) {
        setOffender('');
        setCharge('');
      }
    };

    document.addEventListener('push_transaction_result', pushResultHandler);

    return () => {
      document.removeEventListener(
        'push_transaction_result',
        pushResultHandler,
      );
    };
  }, [presentToast, setOffender, setCharge]);

  return (
    <PageShell
      title="Crucify"
      renderBody={() => (
        <>
          <ConnectionStatus readyState={readyState} />
          <IonList>
            <IonItem lines="none">
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
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => {
                  presentScanner({
                    onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                      setOffender(ev.detail.data);
                    },
                  });
                }}
              >
                <IonIcon slot="icon-only" icon={scanOutline}></IonIcon>
              </IonButton>
            </IonItem>

            <IonItem lines="none">
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

            <IonItem lines="none">
              <IonInput
                className={`${isPassphraseValid && 'ion-valid'} ${
                  isPassphraseValid === false && 'ion-invalid'
                } ${isPassphraseTouched && 'ion-touched'}`}
                label="Passphrase"
                labelPlacement="stacked"
                clearInput={true}
                errorText="Invalid passphrase"
                value={passphrase}
                type="text"
                onIonBlur={onBlurPassphrase}
                onIonInput={(event) =>
                  setPassphrase(event.target.value?.toString() ?? '')
                }
              />
            </IonItem>
          </IonList>

          <IonButton
            disabled={!isOffenderValid || !isChargeValid || !isPassphraseValid}
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            onClick={execute}
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
