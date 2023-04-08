import { accountsReducer } from './accounts/accounts.reducer';
import { layoutSettingsReducer } from './layout-settings/layout-settings.reducer';
import { loggedInUserReducer } from './logged-in-user/logged-in-user.reducer';
import { messagesReducer } from './messages/messages.reducer';
import { selectedAccountIdReducer } from './selected-account-id/selected-account-id.reducer';

export const storeConfig = {
    messages: messagesReducer,
    selectedAccountId: selectedAccountIdReducer,
    accounts: accountsReducer,
    loggedInUser: loggedInUserReducer,
    layoutSettings: layoutSettingsReducer
};
