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
  IonLabel,
  IonList,
  IonTextarea,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import { scanOutline } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useP2P } from '../useCases/useP2P';
import { useInputValidationProps } from '../useCases/useInputValidation';
import KeyViewer from '../components/keyViewer';

const Crucify = () => {
  const {
    value: crossBearer,
    onBlur: onBlurCrossBearer,
    isValid: isCrossBearerValid,
    isTouched: isCrossBearerTouched,
    onInputChange: setCrossBearer,
  } = useInputValidationProps((crossBearer: string) =>
    new RegExp('[A-Za-z0-9/+]{43}=').test(crossBearer),
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

  const { readyState, pushTransaction } = useP2P();

  const execute = (passphrase: string) => {
    if (!isCrossBearerValid || !isChargeValid) {
      return;
    }
    pushTransaction(crossBearer, charge, passphrase);
  };

  const [presentScanner, dismissScanner] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismissScanner(data),
  });

  const [presentToast] = useIonToast();

  const [presentModal, dismiss] = useIonModal(AuthorizeTransaction, {
    onDismiss: () => dismiss(),
    onAuthorize: (passphrase: string) => {
      execute(passphrase);
      dismiss();
    },
    crossBearer,
    charge,
  });

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
        setCrossBearer('');
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
  }, [presentToast, setCrossBearer, setCharge]);

  return (
    <PageShell
      title="Crucify"
      renderBody={() => (
        <>
          <IonList>
            <IonItem lines="none">
              <IonTextarea
                className={`${isCrossBearerValid && 'ion-valid'} ${
                  isCrossBearerValid === false && 'ion-invalid'
                } ${isCrossBearerTouched && 'ion-touched'}`}
                label="Cross bearer"
                labelPlacement="stacked"
                clearOnEdit={true}
                errorText="Invalid public key"
                value={crossBearer}
                onIonBlur={onBlurCrossBearer}
                onIonInput={(event) =>
                  setCrossBearer(event.target.value?.toString() ?? '')
                }
              />
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => {
                  presentScanner({
                    onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                      setCrossBearer(ev.detail.data);
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
                label="Charge"
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
            disabled={!isCrossBearerValid || !isChargeValid}
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            onClick={() =>
              presentModal({
                initialBreakpoint: 0.75,
                breakpoints: [0, 0.75],
              })
            }
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

const AuthorizeTransaction = ({
  onDismiss,
  onAuthorize,
  crossBearer,
  charge,
}: {
  onDismiss: () => void;
  onAuthorize: (passphrase: string) => void;
  crossBearer: string;
  charge: string;
}) => {
  const {
    value: passphrase,
    onBlur: onBlurPassphrase,
    isValid: isPassphraseValid,
    isTouched: isPassphraseTouched,
    onInputChange: setPassphrase,
  } = useInputValidationProps((input: string) => input.length > 0);

  return (
    <div>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Authorize crucifixion</IonCardTitle>
          <IonCardSubtitle>Do you want to proceed?</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            <IonItem lines="none">
              <KeyViewer value={crossBearer} />
            </IonItem>
            <IonItem lines="none">
              <IonLabel>{charge}</IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonItem lines="none">
          <IonInput
            className={`${isPassphraseValid && 'ion-valid'} ${
              isPassphraseValid === false && 'ion-invalid'
            } ${isPassphraseTouched && 'ion-touched'}`}
            label="Enter Passphrase"
            labelPlacement="stacked"
            clearInput={true}
            errorText="Invalid passphrase"
            value={passphrase}
            type="password"
            onIonBlur={onBlurPassphrase}
            onIonInput={(event) =>
              setPassphrase(event.target.value?.toString() ?? '')
            }
          />
        </IonItem>
        <IonButton
          fill="solid"
          expand="block"
          strong={true}
          disabled={!isPassphraseValid}
          onClick={() => onAuthorize(passphrase)}
        >
          Authorize
        </IonButton>
        <IonButton
          fill="outline"
          expand="block"
          strong={true}
          onClick={() => onDismiss()}
        >
          Cancel
        </IonButton>
      </IonCard>
    </div>
  );
};
