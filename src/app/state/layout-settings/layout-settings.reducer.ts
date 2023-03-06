import { createReducer, on } from '@ngrx/store';
import { ILayoutSettngs } from './layout-settings';
import { LayoutSettingsActions } from './layout-settings.actions';

export const initialState: ILayoutSettngs = {
    activeArea: 'contacts'
};

export const LayoutSettingsReducer = createReducer(
    initialState,
    on(LayoutSettingsActions.init, (_state, { settings }) => settings)
);