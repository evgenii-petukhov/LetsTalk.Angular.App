import { createActionGroup, props } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';

export const accountsActions = createActionGroup({
    source: 'Accounts',
    events: {
        init: props<{ accounts: readonly IAccountDto[] }>(),
    },
});
