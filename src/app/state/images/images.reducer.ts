import { createReducer, on } from '@ngrx/store';
import { Image } from 'src/app/models/image';
import { imagesActions } from '../images/images.actions';

export const initialState: readonly Image[] = [];

export const imagesReducer = createReducer(
    initialState,
    on(imagesActions.add, (_state, {image}) => [..._state, image]),
);
