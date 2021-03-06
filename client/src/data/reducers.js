import { ActionTypes } from './actions';

export const apiClient = (state = {}) => state;

export const currentImage = (state = null, action) => {
    switch (action.type) {
        case ActionTypes.SET_CURRENT_IMAGE:
            return action.image;
        default:
            return state;
    }
};

export const heartbeat = (state = null, action) => {
    switch (action.type) {
        case ActionTypes.SET_CURRENT_TIME:
            return action.timestamp;
        default:
            return state || new Date();
    }
};

export const images = (state = null, action) => {
    switch (action.type) {
        case ActionTypes.SET_IMAGES:
            return action.data;
        default:
            return state;
    }
};

export const imageSize = (state = 'small', action) => {
    switch (action.type) {
        case ActionTypes.SET_IMAGE_SIZE:
            return action.imageSize;
        default:
            return state;
    }
};

export const sortOrder = (state = 'date-desc', action) => {
    switch (action.type) {
        case ActionTypes.SET_SORT_ORDER:
            return action.sortOrder;
        default:
            return state;
    }
};
