import { createFeatureSelector } from '@ngrx/store';

export const selectSelectedChatId = createFeatureSelector<string>('selectedChatId');
