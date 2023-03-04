import { AccountsReducer } from "./accounts/accounts.reducer";
import { LoggedInUserReducer } from "./logged-in-user/selected-account-id.reducer";
import { MessagesReducer } from "./messages/messages.reducer";
import { SelectedAccountIdReducer } from "./selected-account-id/selected-account-id.reducer";

export const StoreConfig = {
    messages: MessagesReducer, 
    selectedAccountId: SelectedAccountIdReducer,
    accounts: AccountsReducer,
    loggedInUser: LoggedInUserReducer
};