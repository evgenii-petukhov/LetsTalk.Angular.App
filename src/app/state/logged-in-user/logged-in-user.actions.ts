import { createActionGroup, props } from '@ngrx/store';
import { IProfileDto } from 'src/app/api-client/api-client';

export const loggedInUserActions = createActionGroup({
    source: 'LoggedInUser',
    events: {
        init: props<{account: IProfileDto}>(),
        set: props<{account: IProfileDto}>(),
    }
});
