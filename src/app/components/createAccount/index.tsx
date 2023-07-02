import { useState } from 'react';
import {
  IonButton,
  IonItem,
  IonList,
  IonText,
  IonTextarea,
  IonCard,
  IonCardContent,
  IonChip,
  IonCardSubtitle,
} from '@ionic/react';
import { useInputValidationProps } from '../../useCases/useInputValidation';

const EnterPassPhrase = ({
  applyPassPhrase,
}: {
  applyPassPhrase: (phrase: string) => void;
}) => {
  const {
    value: passPhrase,
    onBlur: onBlurPassPhrase,
    isValid: isPassPhraseValid,
    isTouched: isPassPhraseTouched,
    onInputChange: setPassPhrase,
  } = useInputValidationProps((passPhrase: string) =>
    /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(passPhrase),
  );

  const {
    value: confirmPhrase,
    onBlur: onBlurConfirmPhrase,
    isValid: isConfirmPhraseValid,
    isTouched: isConfirmPhraseTouched,
    onInputChange: setConfirmPhrase,
  } = useInputValidationProps(
    (confirmPhrase: string) => confirmPhrase === passPhrase,
  );

  return (
    <>
      <IonList>
        <IonItem>
          <IonTextarea
            className={`${isPassPhraseValid && 'ion-valid'} ${
              isPassPhraseValid === false && 'ion-invalid'
            } ${isPassPhraseTouched && 'ion-touched'}`}
            label="Passphrase"
            labelPlacement="stacked"
            value={passPhrase}
            onIonBlur={onBlurPassPhrase}
            onIonInput={(event) => setPassPhrase(event.target.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonTextarea
            className={`${isConfirmPhraseValid && 'ion-valid'} ${
              isConfirmPhraseValid === false && 'ion-invalid'
            } ${isConfirmPhraseTouched && 'ion-touched'}`}
            label="Confirm passphrase"
            labelPlacement="stacked"
            value={confirmPhrase}
            onIonBlur={onBlurConfirmPhrase}
            onIonInput={(event) => setConfirmPhrase(event.target.value ?? '')}
          />
        </IonItem>
      </IonList>

      <IonButton
        disabled={!isPassPhraseValid || !isConfirmPhraseValid}
        expand="full"
        onClick={() => applyPassPhrase(passPhrase)}
        class="ion-padding ion-no-margin"
      >
        Create passphrase
      </IonButton>
    </>
  );
};

export const CreateAccount = ({
  generateMnemonic,
  importMnemonic,
  exportMnemonic,
}: {
  generateMnemonic: () => string;
  importMnemonic: (mnemonicPhrase: string, passPhrase: string) => void;
  exportMnemonic: (mnemonicPhrase: string) => void;
}) => {
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');

  return (
    <>
      <IonText class="ion-text-center" color="danger">
        <p>Create a keychain to begin.</p>
      </IonText>
      {!mnemonicPhrase ? (
        <IonButton
          expand="full"
          class="ion-padding ion-no-margin"
          strong={true}
          onClick={() => setMnemonicPhrase(generateMnemonic())}
        >
          Create keychain
        </IonButton>
      ) : (
        <>
          <Mnemonics phrase={mnemonicPhrase} exportMnemonic={exportMnemonic} />
          <IonText class="ion-text-center" color="danger">
            <p>Your passphrase is used to secure your keychain.</p>
          </IonText>
          <IonText class="ion-text-center" color="danger">
            <p>
              Your passphrase must have a number, a special character, a minimum
              of 8 characters, a lowercase and an uppercase.
            </p>
          </IonText>
          <EnterPassPhrase
            applyPassPhrase={(passPhrase) =>
              importMnemonic(mnemonicPhrase, passPhrase)
            }
          />
        </>
      )}
    </>
  );
};

const Mnemonics = ({
  phrase,
  exportMnemonic,
}: {
  phrase: string;
  exportMnemonic: (phrase: string) => void;
}) => {
  return (
    <IonCard>
      <IonCardSubtitle>Secret Recovery Phrase</IonCardSubtitle>
      <IonCardContent>
        {phrase
          .split(/(\s)/)
          .filter((x) => x.trim().length > 0)
          .map((word, index) => (
            <IonChip key={index}>{word}</IonChip>
          ))}
      </IonCardContent>
      <IonButton fill="clear" onClick={() => exportMnemonic(phrase)}>
        Export
      </IonButton>
    </IonCard>
  );
};
