import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipseOutline, squareOutline } from 'ionicons/icons';
import { FaCross } from 'react-icons/fa';
import Crucify from './pages/crucify';
import Field from './pages/field';
import Heart from './pages/heart';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HackIonReactRouter = IonReactRouter as any;

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <HackIonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/field">
            <Field />
          </Route>
          <Route exact path="/heart">
            <Heart />
          </Route>
          <Route exact path="/crucify">
            <Crucify />
          </Route>
          <Route exact path="/">
            <Redirect to="/field" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="field" href="/field">
            <IonIcon aria-hidden="true" icon={squareOutline} />
            <IonLabel>Field</IonLabel>
          </IonTabButton>
          <IonTabButton tab="crucify" href="/crucify">
            <FaCross />
          </IonTabButton>
          <IonTabButton tab="heart" href="/heart">
            <IonIcon aria-hidden="true" icon={ellipseOutline} />
            <IonLabel>Heart</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </HackIonReactRouter>
  </IonApp>
);

export default App;
