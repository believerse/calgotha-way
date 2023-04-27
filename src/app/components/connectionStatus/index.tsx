import './style.css';
import { ReadyState } from 'react-use-websocket';

interface ConnectionStatusProps {
  readyState: ReadyState;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ readyState }) => {
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return readyState !== ReadyState.OPEN ? (
    <div className="connection-status-root">
      <strong>Not connected</strong>
      <p>
        <i>{connectionStatus}</i>
      </p>
    </div>
  ) : null;
};

export default ConnectionStatus;
