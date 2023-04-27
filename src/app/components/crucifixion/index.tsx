import './style.css';
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  useIonModal,
  IonText,
} from '@ionic/react';
import timeago from 'epoch-timeago';
import { PageShell } from '../pageShell';
import { Transaction } from '../../useCases/useStore';

export const CrucifixionItem: React.FC<Transaction> = (crucifixion) => {
  const [present, dismiss] = useIonModal(CrucifixionDetail, {
    onDismiss: () => dismiss(),
    crucifixion,
  });

  const { time, memo } = crucifixion;

  const timeMS = time * 1000;

  return (
    <IonItem onClick={() => present()}>
      <IonLabel className="ion-text-wrap">
        <IonText color="primary">
          <sub>{crucifixion.to}</sub>
        </IonText>
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
      {crucifixions.map((tx) => (
        <CrucifixionItem
          key={tx.time}
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
            <IonCardSubtitle>{crucifixion.to}</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>{crucifixion.memo}</IonCardContent>
        </IonCard>
      )}
    />
  );
};
