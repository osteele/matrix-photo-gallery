import axios from 'axios';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.css';
import App from './App';
import {
    getEvents,
    setSensorData,
    setWindowSize,
    updateTime
} from './data/actions';
import setupStore from './data/store';

const HEARTBEAT_HZ = 10;
const API_SERVER_URL = process.env.API_SERVER_URL || 'http://127.0.0.1:5000/';
const AUDIO_BASE_URL = process.env.AUDIO_BASE_URL || API_SERVER_URL + 'static';

const apiClient = axios.create({
    baseURL: API_SERVER_URL
});

const store = setupStore({
    apiClient,
    audioBaseUrl: AUDIO_BASE_URL,
    paused: Boolean(window.location.hash.match(/[#&]paused\b/))
});

store.dispatch(getEvents());

setInterval(
    () => store.getState().paused || store.dispatch(updateTime()),
    Math.floor(1000 / HEARTBEAT_HZ)
);

const WEBSOCKET_URL = API_SERVER_URL.replace(/^http/, 'ws') + 'sensor_data';
const sensorDataSocket = new WebSocket(WEBSOCKET_URL);
sensorDataSocket.onerror = err => {
    console.error('WebSocket error', err);
};
sensorDataSocket.onmessage = event => {
    const data = JSON.parse(event.data);
    store.dispatch(setSensorData(data, new Date()));
};

window.addEventListener('resize', () => {
    store.dispatch(
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    );
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);
