import moment from 'moment';
import 'moment-timezone';
import tideTable from './tide-table.json';

window.tideTable = tideTable;

export const ActionTypes = {
    SET_IMAGES: 'SET_IMAGES',
    SET_IMAGE_SIZE: 'SET_IMAGE_SIZE',
    SET_SORT_ORDER: 'SET_SORT_ORDER',
    SET_BACKGROUND: 'SET_BACKGROUND',
    SET_CURRENT_TIME: 'SET_CURRENT_TIME',
    SET_VIEW_CLASS: 'SET_VIEW_CLASS'
};

const computeTideLevel = timestamp => {
    const month = tideTable[timestamp.month() + 1];
    const day = month && month[timestamp.date() - 1];
    if (!day) {
        console.info('missing tide level for', timestamp.format('ll'));
    }
    // TODO: interpolate into next day
    const s0 = day && day[timestamp.hour()];
    const s1 = day && day[timestamp.hour() + 1];
    return s0 === undefined || s1 === undefined
        ? s0
        : s0 + (timestamp.minute() / 60) * (s1 - s0);
};

const decodeImage = image => {
    const timestamp = moment(image.timestamp).tz('Asia/Bangkok');
    return {
        ...image,
        timestamp,
        thumbnail_url:
            image.small_thumbnail_url || image.thumbnail_url || image.image_url,
        sender: image.sender.replace(/@(.+):matrix.org/, '$1'),
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

export const setBackground = background => {
    document.body.style.backgroundColor = background;
    return {
        type: ActionTypes.SET_BACKGROUND,
        background
    };
};

export const setImageSize = imageSize => ({
    type: ActionTypes.SET_IMAGE_SIZE,
    imageSize
});

export const setSortOrder = sortOrder => ({
    type: ActionTypes.SET_SORT_ORDER,
    sortOrder
});

export const setViewClass = viewClass => (dispatch, getStore) =>
    getStore().viewClass === viewClass ||
    dispatch({
        type: ActionTypes.SET_VIEW_CLASS,
        viewClass
    });

export const updateTime = () => ({
    type: ActionTypes.SET_CURRENT_TIME,
    timestamp: new Date()
});
