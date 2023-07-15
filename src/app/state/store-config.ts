import { accountsReducer } from './accounts/accounts.reducer';
import { imagesReducer } from './images/images.reducer';
import { layoutSettingsReducer } from './layout-settings/layout-settings.reducer';
import { loggedInUserReducer } from './logged-in-user/logged-in-user.reducer';
import { messagesReducer } from './messages/messages.reducer';
import { selectedAccountIdReducer } from './selected-account-id/selected-account-id.reducer';
import { viewedImageIdReducer } from './viewed-image-id/viewed-image-id.reducer';

export const storeConfig = {
    messages: messagesReducer,
    selectedAccountId: selectedAccountIdReducer,
    accounts: accountsReducer,
    loggedInUser: loggedInUserReducer,
    layoutSettings: layoutSettingsReducer,
    images: imagesReducer,
    viewedImageId: viewedImageIdReducer
};
