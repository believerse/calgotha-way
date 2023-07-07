import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  useIonModal,
  IonText,
  IonNote,
  IonIcon,
} from '@ionic/react';
import timeago from 'epoch-timeago';
import { arrowForwardOutline } from 'ionicons/icons';
import { PageShell } from '../pageShell';
import { Transaction } from '../../useCases/useStore';
import KeyViewer from '../keyViewer';

export const CrucifixionItem: React.FC<Transaction> = (crucifixion) => {
  const [present, dismiss] = useIonModal(CrucifixionDetail, {
    onDismiss: () => dismiss(),
    crucifixion,
  });

  const { time, memo } = crucifixion;

  const timeMS = time * 1000;

  return (
    <IonItem lines="none" onClick={() => present()}>
      <IonLabel className="ion-text-wrap">
        <KeyViewer value={crucifixion.from} />
        <IonIcon icon={arrowForwardOutline} color="primary"></IonIcon>
        <KeyViewer value={crucifixion.to} />
        <IonText color="tertiary">
          <sub>
            <time dateTime={new Date(timeMS).toISOString()}>
              <p>{timeago(timeMS)}</p>
            </time>
          </sub>
        </IonText>
        {memo && <p>{memo}</p>}
      </IonLabel>
    </IonItem>
  );
};

export default CrucifixionItem;

interface CrucifixionListProps {
  heading?: string;
  crucifixions: Transaction[];
}

export const CrucifixionList = ({
  crucifixions,
  heading,
}: CrucifixionListProps) => {
  return (
    <IonList>
      {heading && (
        <IonListHeader>
          <IonLabel>{heading}</IonLabel>
        </IonListHeader>
      )}
      {crucifixions.map((tx, index) => (
        <CrucifixionItem
          key={index}
          from={tx.from}
          to={tx.to}
          memo={tx.memo}
          time={tx.time}
        />
      ))}
    </IonList>
  );
};

export const CrucifixionDetail = ({
  onDismiss,
  crucifixion,
}: {
  onDismiss: () => void;
  crucifixion: Transaction;
}) => {
  return (
    <PageShell
      title="Crucified"
      tools={[{ label: 'Cancel', action: onDismiss }]}
      renderBody={() => (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Crucifixion notice</IonCardTitle>
            <IonLabel>
              <IonNote>
                {new Date(crucifixion.time * 1000).toDateString()}
              </IonNote>
            </IonLabel>
          </IonCardHeader>
          <IonCardContent>
            <p>
              From: <KeyViewer value={crucifixion.from} />
            </p>
            <p>
              To: <KeyViewer value={crucifixion.to} />
            </p>
            <p>{crucifixion.memo}</p>
          </IonCardContent>
        </IonCard>
      )}
    />
  );
};
