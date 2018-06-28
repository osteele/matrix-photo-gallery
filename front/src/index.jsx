import axios from 'axios';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.css';
import App from './App';
import { getEvents } from './data/actions';
import setupStore from './data/store';

const API_SERVER_URL = process.env.API_SERVER_URL || 'http://127.0.0.1:3000/';
const store = setupStore(axios.create({ baseURL: API_SERVER_URL }));

store.dispatch(getEvents());

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);
