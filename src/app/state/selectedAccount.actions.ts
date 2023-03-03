import { createActionGroup, props } from "@ngrx/store";
import { AccountDto } from "../api-client/api-client";

export const SelectedAccountActions = createActionGroup({
    source: 'SelectedAccount',
    events: {
        'init': props<{account: AccountDto}>(),
    }
});