import { createActionGroup, props } from "@ngrx/store";
import { AccountDto } from "src/app/api-client/api-client";

export const LoggedInUserActions = createActionGroup({
    source: 'LoggedInUser',
    events: {
        'init': props<{account: AccountDto}>(),
    }
});