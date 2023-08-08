import { createReducer, on } from '@ngrx/store';
import { ILayoutSettngs } from '../../models/layout-settings';
import { layoutSettingsActions } from './layout-settings.actions';

export const initialState: ILayoutSettngs = {
    activeArea: 'contacts'
};

export const layoutSettingsReducer = createReducer(
    initialState,
    on(layoutSettingsActions.init, (_state, { settings }) => ({ ..._state, ...settings }))
);
