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
} from '@ionic/react';
import { PageShell } from '../pageShell';
import { Transaction } from '../../useCases/useStore';

export const CrucifixionItem: React.FC<Transaction> = (crucifixion) => {
  const [present, dismiss] = useIonModal(CrucifixionDetail, {
    onDismiss: () => dismiss(),
    crucifixion,
  });

  return (
    <IonItem onClick={() => present()}>
      <IonLabel>
        <h2>
          <b>Crucified for...</b>
        </h2>
        {crucifixion.memo && <p>{crucifixion.memo}</p>}
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
