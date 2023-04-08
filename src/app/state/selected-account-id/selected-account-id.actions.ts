import { createActionGroup, props } from '@ngrx/store';

export const selectedAccountIdActions = createActionGroup({
    source: 'SelectedAccountId',
    events: {
        init: props<{accountId: number}>(),
    }
});
