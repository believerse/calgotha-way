import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

interface ToolBarButton {
  label: string;
  action: () => void;
}

interface Props {
  title: string;
  renderBody: () => JSX.Element;
  tools?: ToolBarButton[];
}

export const PageShell = ({ title, renderBody, tools }: Props) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          {!!tools?.length && (
            <IonButtons slot="end">
              {tools.map((tool) => (
                <IonButton key={tool.label} onClick={tool.action}>
                  {tool.label}
                </IonButton>
              ))}
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {renderBody()}
      </IonContent>
    </IonPage>
  );
};
