import { createActionGroup, props } from "@ngrx/store";

export const SelectedAccountIdActions = createActionGroup({
    source: 'SelectedAccountId',
    events: {
        'init': props<{accountId: number}>(),
    }
});