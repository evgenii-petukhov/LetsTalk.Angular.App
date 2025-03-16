import { createReducer, on } from '@ngrx/store';
import { viewedImageKeyActions } from './viewed-image-key.actions';
import { IImageDto } from 'src/app/api-client/api-client';

export const initialState: IImageDto = null;

export const viewedImageKeyReducer = createReducer(
    initialState,
    on(
        viewedImageKeyActions.init,
        (_state, { id, fileStorageTypeId }) => id ? { id, fileStorageTypeId } : null,
    ),
);
