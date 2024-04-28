import { createActionGroup, props } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';

export const accountsActions = createActionGroup({
    source: 'Accounts',
    events: {
        init: props<{accounts: readonly IChatDto[]}>(),
    }
});
