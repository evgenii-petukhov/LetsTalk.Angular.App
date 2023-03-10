import { createActionGroup, props } from "@ngrx/store";
import { IAccountDto } from "src/app/api-client/api-client";

export const AccountsActions = createActionGroup({
    source: 'Accounts',
    events: {
        'init': props<{accounts: ReadonlyArray<IAccountDto>}>(),
        'readAll': props<{accountId: number}>(),
        'incrementUnread': props<{accountId: number}>(),
        'setLastMessageDate': props<{accountId: number, date: number}>(),
    }
});