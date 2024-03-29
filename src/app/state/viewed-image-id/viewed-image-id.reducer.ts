import { createReducer, on } from '@ngrx/store';
import { viewedImageIdActions } from './viewed-image-id.actions';

export const initialState: string = null;

export const viewedImageIdReducer = createReducer(
    initialState,
    on(viewedImageIdActions.init, (_state, { imageId }) => imageId),
);
