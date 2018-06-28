export const ActionTypes = {
    SET_IMAGES: 'SET_IMAGES'
};

export const getEvents = () => (dispatch, getStore) =>
    getStore()
        .apiClient.get('/images/')
        .then(({ data }) =>
            dispatch({ type: ActionTypes.SET_IMAGES, data: data.slice(0, 10) })
        );
