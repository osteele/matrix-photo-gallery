export const ActionTypes = {
    SET_IMAGES: 'SET_IMAGES',
    SET_IMAGE_SIZE: 'SET_IMAGE_SIZE',
    SET_SORT_ORDER: 'SET_SORT_ORDER'
};

const decodeImage = event => {
    return {
        ...event,
        timestamp: Date.parse(event.timestamp.replace(/\..+/, '')),
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

export const setImageSize = imageSize => dispatch =>
    dispatch({ type: ActionTypes.SET_IMAGE_SIZE, imageSize });

export const setSortOrder = sortOrder => dispatch =>
    dispatch({ type: ActionTypes.SET_SORT_ORDER, sortOrder });
