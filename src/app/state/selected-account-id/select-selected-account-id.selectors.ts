import { createFeatureSelector } from '@ngrx/store';

export const selectSelectedAccountId = createFeatureSelector<number>('selectedAccountId');
