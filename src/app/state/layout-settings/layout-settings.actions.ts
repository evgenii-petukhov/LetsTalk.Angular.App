import { createActionGroup, props } from '@ngrx/store';
import { ILayoutSettings } from '../../models/layout-settings';

export const layoutSettingsActions = createActionGroup({
    source: 'Layout',
    events: {
        init: props<{ settings: ILayoutSettings }>(),
    },
});
