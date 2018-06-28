import { ActionTypes } from './actions';

export const apiClient = (state = {}) => state;

export const images = (state = {}, action) => {
    switch (action.type) {
        case ActionTypes.SET_IMAGES:
            return action.data;
        default:
            return state;
    }
};
