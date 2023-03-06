import { createActionGroup, props } from "@ngrx/store";
import { IAccountDto } from "src/app/api-client/api-client";

export const LoggedInUserActions = createActionGroup({
    source: 'LoggedInUser',
    events: {
        'init': props<{account: IAccountDto}>(),
    }
});