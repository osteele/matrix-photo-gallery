import moment from 'moment';
import 'moment-timezone';

export const ActionTypes = {
    SET_IMAGES: 'SET_IMAGES',
    SET_IMAGE_SIZE: 'SET_IMAGE_SIZE',
    SET_SORT_ORDER: 'SET_SORT_ORDER',
    SET_CURRENT_TIME: 'SET_CURRENT_TIME'
};

const decodeImage = event => {
    return {
        ...event,
        timestamp: moment(event.timestamp).tz('Asia/Bangkok'),
        sender: event.sender.replace(/@(.+):matrix.org/, '$1')
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
