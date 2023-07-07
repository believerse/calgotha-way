import { useState } from 'react';
import {
  IonInput,
  IonButton,
  IonItem,
  IonList,
  IonText,
  IonTextarea,
  IonChip,
} from '@ionic/react';
import { useInputValidationProps } from '../../useCases/useInputValidation';

const EnterPassPhrase = ({
  applyPassPhrase,
  requiresConfirmation,
}: {
  applyPassPhrase: (phrase: string) => void;
  requiresConfirmation: boolean;
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

        {requiresConfirmation && (
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
        )}
      </IonList>

      <IonButton
        disabled={
          !isPassPhraseValid || (requiresConfirmation && !isConfirmPhraseValid)
        }
        expand="block"
        onClick={() => applyPassPhrase(passPhrase)}
        class="ion-padding ion-no-margin"
      >
        {requiresConfirmation ? 'Create passphrase' : 'Apply passphrase'}
      </IonButton>
    </>
  );
};

export const CreateAccount = ({
  generateSecretPhrase,
  importKeychain,
  copyPhrase,
}: {
  generateSecretPhrase: () => string;
  importKeychain: (secretPhrase: string, passPhrase: string) => void;
  copyPhrase: (secretPhrase: string) => void;
}) => {
  const {
    value: secretPhrase,
    isValid: isSecretPhraseValid,
    isTouched: isSecretPhraseTouched,
    onBlur: onBlurSecretPhrase,
    onInputChange: setSecretPhrase,
  } = useInputValidationProps(
    (secretPhrase: string) =>
      secretPhrase.split(/(\s)/).filter((x) => x.trim().length > 0).length ===
      12,
  );

  const [secretPhraseMode, setSecretPhraseMode] = useState<'create' | 'import'>(
    'create',
  );

  const [step, setStep] = useState<'start' | 'secretphrase' | 'passphrase'>(
    'start',
  );

  return (
    <>
      {step === 'secretphrase' && secretPhraseMode === 'import' && (
        <>
          <IonItem>
            <IonTextarea
              className={`${isSecretPhraseValid && 'ion-valid'} ${
                isSecretPhraseValid === false && 'ion-invalid'
              } ${isSecretPhraseTouched && 'ion-touched'}`}
              label="Secret phrase"
              labelPlacement="stacked"
              value={secretPhrase}
              onIonBlur={onBlurSecretPhrase}
              onIonInput={(event) => setSecretPhrase(event.target.value ?? '')}
            />
          </IonItem>
          <IonButton
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            disabled={!isSecretPhraseValid}
            onClick={() => setStep('passphrase')}
          >
            Import
          </IonButton>
          <CancelButton action={() => setStep('start')} />
        </>
      )}
      {step === 'secretphrase' &&
        secretPhraseMode === 'create' &&
        isSecretPhraseValid && (
          <>
            <SecretPhrase
              confirm={() => setStep('passphrase')}
              cancel={() => setStep('start')}
              phrase={secretPhrase}
              copyPhrase={copyPhrase}
            />
          </>
        )}
      {step === 'passphrase' && isSecretPhraseValid && (
        <>
          <EnterPassPhrase
            requiresConfirmation={secretPhraseMode === 'create'}
            applyPassPhrase={(passPhrase) =>
              importKeychain(secretPhrase, passPhrase)
            }
          />

          <IonText class="ion-text-center" color="danger">
            <p>Your passphrase is used to secure your keychain.</p>
          </IonText>
          <IonText class="ion-text-center" color="danger">
            <p>
              Your passphrase must have a number, a special character, a minimum
              of 8 characters, a lowercase and an uppercase.
            </p>
          </IonText>
        </>
      )}

      {step === 'start' && (
        <>
          <IonButton
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            onClick={() => {
              setSecretPhrase(generateSecretPhrase());
              setStep('secretphrase');
              setSecretPhraseMode('create');
            }}
          >
            Create keychain
          </IonButton>
          <IonText class="ion-text-center" color="medium">
            <p>or</p>
          </IonText>
          <IonButton
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            onClick={() => {
              setStep('secretphrase');
              setSecretPhraseMode('import');
            }}
          >
            Import keychain
          </IonButton>
        </>
      )}
    </>
  );
};

const getRandomRange = (max: number, count: number) => {
  const set = new Set<number>();

  do {
    set.add(Math.floor(Math.random() * max));
  } while (set.size < count);

  return set;
};

const randomIndices = getRandomRange(12, 3);

const SecretPhrase = ({
  phrase,
  copyPhrase,
  confirm,
  cancel,
}: {
  phrase: string;
  copyPhrase: (phrase: string) => void;
  confirm: () => void;
  cancel: () => void;
}) => {
  const words = phrase.split(/(\s)/).filter((x) => x.trim().length > 0);

  const [isConfirmationMode, setIsConfirmationMode] = useState(false);

  const [confirmedWords, setConfirmedWords] = useState<{
    [key: number]: string;
  }>([...randomIndices].reduce((acc, cur) => ({ ...acc, [cur]: '' }), {}));

  const isConfirmationValid = () =>
    Object.entries(confirmedWords).every(
      ([index, word]) => words[Number(index)] === word,
    );

  return isConfirmationMode ? (
    <>
      <section className="ion-padding">
        {words.map((word, index) => {
          if (randomIndices.has(index)) {
            return (
              <IonChip key={index} outline={true}>
                <IonInput
                  style={{ maxWidth: 60 }}
                  aria-label={`${index + 1}`}
                  type="text"
                  onIonInput={(val) =>
                    setConfirmedWords({
                      ...confirmedWords,
                      [index]: val.target.value?.toString() ?? '',
                    })
                  }
                />
              </IonChip>
            );
          } else {
            return <IonChip key={index}>{word}</IonChip>;
          }
        })}
      </section>

      <IonButton
        expand="block"
        class="ion-padding ion-no-margin"
        strong={true}
        disabled={!isConfirmationValid()}
        onClick={() => {
          if (isConfirmationValid()) {
            confirm();
          }
        }}
      >
        Confirm
      </IonButton>

      <CancelButton action={() => setIsConfirmationMode(false)} />
    </>
  ) : (
    <>
      <section className="ion-padding">
        {words.map((word, index) => (
          <IonChip key={index}>{word}</IonChip>
        ))}
      </section>

      <IonButton
        fill="clear"
        expand="block"
        class="ion-padding ion-no-margin"
        strong={true}
        onClick={() => copyPhrase(phrase)}
      >
        Copy
      </IonButton>
      <IonButton
        expand="block"
        class="ion-padding ion-no-margin"
        strong={true}
        onClick={() => setIsConfirmationMode(true)}
      >
        Next
      </IonButton>
      <CancelButton action={cancel} />
    </>
  );
};

const CancelButton = ({ action }: { action: () => void }) => (
  <IonButton
    fill="outline"
    expand="block"
    className="ion-padding ion-no-margin"
    strong={true}
    onClick={action}
  >
    Cancel
  </IonButton>
);
