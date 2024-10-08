import { createFeatureSelector } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';

export const selectAccounts =
    createFeatureSelector<readonly IAccountDto[]>('accounts');
