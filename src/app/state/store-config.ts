import { accountsReducer } from './accounts/accounts.reducer';
import { chatsReducer } from './chats/chats.reducer';
import { imageCacheReducer } from './image-cache/image-cache.reducer';
import { layoutSettingsReducer } from './layout-settings/layout-settings.reducer';
import { loggedInUserReducer } from './logged-in-user/logged-in-user.reducer';
import { messagesReducer } from './messages/messages.reducer';
import { selectedChatIdReducer } from './selected-chat/selected-chat-id.reducer';

export const storeConfig = {
    messages: messagesReducer,
    selectedChatId: selectedChatIdReducer,
    chats: chatsReducer,
    accounts: accountsReducer,
    loggedInUser: loggedInUserReducer,
    layoutSettings: layoutSettingsReducer,
    imageCache: imageCacheReducer,
};
