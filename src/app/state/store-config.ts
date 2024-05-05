import { accountsReducer } from './accounts/accounts.reducer';
import { chatsReducer } from './chats/chats.reducer';
import { imagesReducer } from './images/images.reducer';
import { layoutSettingsReducer } from './layout-settings/layout-settings.reducer';
import { loggedInUserReducer } from './logged-in-user/logged-in-user.reducer';
import { messagesReducer } from './messages/messages.reducer';
import { selectedChatIdReducer } from './selected-chat/selected-chat-id.reducer';
import { viewedImageIdReducer } from './viewed-image-id/viewed-image-id.reducer';

export const storeConfig = {
    messages: messagesReducer,
    selectedChatId: selectedChatIdReducer,
    chats: chatsReducer,
    accounts: accountsReducer,
    loggedInUser: loggedInUserReducer,
    layoutSettings: layoutSettingsReducer,
    images: imagesReducer,
    viewedImageId: viewedImageIdReducer
};
