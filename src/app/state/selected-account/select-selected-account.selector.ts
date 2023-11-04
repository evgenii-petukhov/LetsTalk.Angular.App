import { createSelector } from '@ngrx/store';
import { selectAccounts } from '../accounts/accounts.selector';
import { selectSelectedAccountId } from '../selected-account-id/select-selected-account-id.selectors';

export const selectSelectedAccount = createSelector(
    selectAccounts,
    selectSelectedAccountId,
    (accounts, accountId) => accounts?.find(account => account.id === accountId));
