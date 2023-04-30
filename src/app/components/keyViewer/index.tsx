import { IonChip, IonIcon, IonLabel, IonText, useIonModal } from '@ionic/react';
import { qrCodeOutline, copyOutline } from 'ionicons/icons';
import QRCode from 'react-qr-code';

interface KeyViewerProps {
  value: string;
}

const KeyViewer: React.FC<KeyViewerProps> = ({ value }) => {
  const [present, dismiss] = useIonModal(KeyDetails, {
    onDismiss: () => dismiss(),
    value,
  });

  return value ? (
    <IonChip
      onClick={(e) => {
        e.stopPropagation();
        present({
          initialBreakpoint: 0.5,
          breakpoints: [0, 0.5, 0.75],
        });
      }}
    >
      <IonIcon icon={qrCodeOutline} color="primary"></IonIcon>
      <code>
        {value.substring(0, 5)}...{value.substring(40)}
      </code>
    </IonChip>
  ) : null;
};

export default KeyViewer;

const KeyDetails = ({
  onDismiss,
  value,
}: {
  onDismiss: () => void;
  value: string;
}) => {
  return (
    <>
      <div
        style={{
          height: 'auto',
          margin: '20px auto',
          maxWidth: 200,
          width: '100%',
        }}
      >
        <QRCode
          id="QRCode"
          size={256}
          style={{
            background: 'white',
            padding: '8px',
            height: 'auto',
            maxWidth: '100%',
            width: '100%',
          }}
          value={value}
          viewBox={`0 0 256 256`}
        />
        <IonChip onClick={() => navigator.clipboard.writeText(value)}>
          <code>
            {value.substring(0, 5)}...{value.substring(40)}
          </code>
          <IonIcon icon={copyOutline} color="primary"></IonIcon>
        </IonChip>
      </div>
    </>
  );
};
