import { createActionGroup, props } from "@ngrx/store";
import { AccountDto } from "src/app/api-client/api-client";

export const AccountsActions = createActionGroup({
    source: 'Accounts',
    events: {
        'init': props<{accounts: ReadonlyArray<AccountDto>}>()
    }
});