import { createReducer, on } from '@ngrx/store';
import { ILayoutSettings } from '../../models/layout-settings';
import { layoutSettingsActions } from './layout-settings.actions';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { ActiveArea } from 'src/app/enums/active-areas';

export const initialState: ILayoutSettings = {
    activeArea: ActiveArea.sidebar,
    sidebarState: SidebarState.chats,
};

export const layoutSettingsReducer = createReducer(
    initialState,
    on(layoutSettingsActions.init, (_state, { settings }) => ({
        ..._state,
        ...settings,
    })),
);
