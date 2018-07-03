import { ActionTypes } from './actions';

export const apiClient = (state = {}) => state;

export const background = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_BACKGROUND:
            return action.background;
        default:
            return state;
    }
};

export const heartbeat = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_CURRENT_TIME:
            return action.timestamp;
        default:
            return state;
    }
};

export const images = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_IMAGES:
            return action.data;
        default:
            return state;
    }
};

export const imageSize = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_IMAGE_SIZE:
            return action.imageSize;
        default:
            return state;
    }
};

export const sortOrder = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_SORT_ORDER:
            return action.sortOrder;
        default:
            return state;
    }
};
