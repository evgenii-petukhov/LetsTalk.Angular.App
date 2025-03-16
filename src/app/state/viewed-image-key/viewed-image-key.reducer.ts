import { createReducer, on } from '@ngrx/store';
import { viewedImageKeyActions } from './viewed-image-key.actions';
import { ImageKey } from 'src/app/models/image-key';

export const initialState: ImageKey = null;

export const viewedImageKeyReducer = createReducer(
    initialState,
    on(
        viewedImageKeyActions.init,
        (_state, { imageId, fileStorageTypeId }) => ({
            imageId,
            fileStorageTypeId,
        }),
    ),
);
