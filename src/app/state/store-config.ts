import { AccountsReducer } from "./accounts/accounts.reducer";
import { LayoutSettingsReducer } from "./layout-settings/layout-settings.reducer";
import { LoggedInUserReducer } from "./logged-in-user/logged-in-user.reducer";
import { MessagesReducer } from "./messages/messages.reducer";
import { SelectedAccountIdReducer } from "./selected-account-id/selected-account-id.reducer";

export const StoreConfig = {
    messages: MessagesReducer, 
    selectedAccountId: SelectedAccountIdReducer,
    accounts: AccountsReducer,
    loggedInUser: LoggedInUserReducer,
    layoutSettings: LayoutSettingsReducer
};