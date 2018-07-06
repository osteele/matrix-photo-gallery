import axios from 'axios';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.css';
import App from './App';
import {
    getEvents,
    setSensorData,
    updateTime,
    setWindowSize
} from './data/actions';
import setupStore from './data/store';

const HEARTBEAT_HZ = 10;
const API_SERVER_URL = process.env.API_SERVER_URL || 'http://127.0.0.1:5000/';

const apiClient = axios.create({
    baseURL: API_SERVER_URL
});

const store = setupStore({
    apiClient,
    audioBaseUrl: API_SERVER_URL + 'static',
    paused: Boolean(window.location.hash.match(/#paused\b/))
});

store.dispatch(getEvents());

setInterval(
    () => store.getState().paused || store.dispatch(updateTime()),
    Math.floor(1000 / HEARTBEAT_HZ)
);

setInterval(
    () =>
        apiClient
            .get('/sensor')
            .catch(err => console.error(err))
            .then(({ data }) => store.dispatch(setSensorData(data))),
    Math.floor(1000 / 10)
);

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
