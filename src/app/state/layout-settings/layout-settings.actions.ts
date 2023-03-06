import { createActionGroup, props } from "@ngrx/store";
import { ILayoutSettngs } from "./layout-settings";

export const LayoutSettingsActions = createActionGroup({
    source: 'Layout',
    events: {
        'init': props<{ settings: ILayoutSettngs }>(),
    }
});