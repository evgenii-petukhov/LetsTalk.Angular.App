import { createFeatureSelector } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';

export const selectAccounts = createFeatureSelector<readonly IChatDto[]>('accounts');
