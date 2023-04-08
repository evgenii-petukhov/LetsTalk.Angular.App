import { createActionGroup, props } from '@ngrx/store';
import { ILayoutSettngs } from './layout-settings';

export const layoutSettingsActions = createActionGroup({
    source: 'Layout',
    events: {
        init: props<{ settings: ILayoutSettngs }>(),
    }
});
