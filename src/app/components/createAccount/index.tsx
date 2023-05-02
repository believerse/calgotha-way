import {
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { useInputValidationProps } from '../../useCases/useInputValidation';

const ImportKeys = ({
  importKeyPairB64,
}: {
  importKeyPairB64: (pk: string, sk: string) => void;
}) => {
  const {
    value: publicKey,
    onBlur: onBlurPublicKey,
    isValid: isPublicKeyValid,
    isTouched: isPublicKeyTouched,
    onInputChange: setPublicKey,
  } = useInputValidationProps((publicKey: string) =>
    new RegExp('[A-Za-z0-9/+]{43}=').test(publicKey),
  );

  const {
    value: secretKey,
    onBlur: onBlurSecretKey,
    isValid: isSecretKeyValid,
    isTouched: isSecretKeyTouched,
    onInputChange: setSecretKey,
  } = useInputValidationProps(
    (secretKey: string) => secretKey.length > 0 || secretKey.length <= 140,
  );

  return (
    <>
      <IonList>
        <IonItem>
          <IonTextarea
            className={`${isPublicKeyValid && 'ion-valid'} ${
              isPublicKeyValid === false && 'ion-invalid'
            } ${isPublicKeyTouched && 'ion-touched'}`}
            label="Public Key"
            labelPlacement="stacked"
            counter={true}
            maxlength={44}
            value={publicKey}
            onIonBlur={onBlurPublicKey}
            onIonInput={(event) => setPublicKey(event.target.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonTextarea
            className={`${isSecretKeyValid && 'ion-valid'} ${
              isSecretKeyValid === false && 'ion-invalid'
            } ${isSecretKeyTouched && 'ion-touched'}`}
            label="Secret Key"
            labelPlacement="stacked"
            counter={true}
            maxlength={88}
            value={secretKey}
            onIonBlur={onBlurSecretKey}
            onIonInput={(event) => setSecretKey(event.target.value ?? '')}
          />
        </IonItem>
      </IonList>

      <IonButton
        disabled={!isPublicKeyValid || !isSecretKeyValid}
        expand="full"
        onClick={() => importKeyPairB64(publicKey, secretKey)}
        class="ion-padding ion-no-margin"
      >
        Import keypair
      </IonButton>
    </>
  );
};

export const CreateAccount = ({
  generateKeyPairB64,
  importKeyPairB64,
}: {
  generateKeyPairB64: () => void;
  importKeyPairB64: (pk: string, sk: string) => void;
}) => {
  return (
    <>
      <IonText class="ion-text-center" color="danger">
        <p>No account keypair, create one to begin.</p>
      </IonText>
      <IonButton
        expand="full"
        class="ion-padding ion-no-margin"
        strong={true}
        onClick={() => generateKeyPairB64()}
      >
        Create keypair
      </IonButton>
      <IonText class="ion-text-center" color="tertiary">
        <p>or</p>
      </IonText>

      <ImportKeys importKeyPairB64={importKeyPairB64} />
    </>
  );
};
