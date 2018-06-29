import moment from 'moment';
import 'moment-timezone';
import tideTable from './tide-table.json';

window.tideTable = tideTable;

export const ActionTypes = {
    SET_IMAGES: 'SET_IMAGES',
    SET_IMAGE_SIZE: 'SET_IMAGE_SIZE',
    SET_SORT_ORDER: 'SET_SORT_ORDER',
    SET_CURRENT_TIME: 'SET_CURRENT_TIME'
};

const computeTideLevel = timestamp => {
    const month = tideTable[timestamp.month() + 1];
    const day = month && month[timestamp.date() - 1];
    if (!day) {
        console.info('missing tide level for', timestamp.format('ll'));
    }
    // TODO: interpolate
    return day && day[timestamp.hour()];
};

const decodeImage = event => {
    const timestamp = moment(event.timestamp).tz('Asia/Bangkok');
    return {
        ...event,
        timestamp,
        sender: event.sender.replace(/@(.+):matrix.org/, '$1'),
        tideLevel: computeTideLevel(timestamp)
    };
};

export const getEvents = () => (dispatch, getStore) =>
    getStore()
        .apiClient.get('/images/')
        .then(({ data }) =>
            dispatch({
                type: ActionTypes.SET_IMAGES,
                data: data.map(decodeImage)
            })
        );

export const setImageSize = imageSize => ({
    type: ActionTypes.SET_IMAGE_SIZE,
    imageSize
});

export const setSortOrder = sortOrder => ({
    type: ActionTypes.SET_SORT_ORDER,
    sortOrder
});

export const updateTime = () => ({
    type: ActionTypes.SET_CURRENT_TIME,
    timestamp: new Date()
});
