import { createReducer, on } from '@ngrx/store';
import { ILayoutSettings } from '../../models/layout-settings';
import { layoutSettingsActions } from './layout-settings.actions';
import { SidebarState } from 'src/app/enums/sidebar-state';

export const initialState: ILayoutSettings = {
    sidebarState: SidebarState.chats,
};

export const layoutSettingsReducer = createReducer(
    initialState,
    on(layoutSettingsActions.init, (_state, { settings }) => ({
        ..._state,
        ...settings,
    })),
);
