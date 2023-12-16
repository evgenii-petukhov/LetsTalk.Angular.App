import { createFeatureSelector } from '@ngrx/store';

export const selectViededImageId = createFeatureSelector<string>('viewedImageId');
