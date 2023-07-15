import { createFeatureSelector } from '@ngrx/store';

export const selectViededImageId = createFeatureSelector<number>('viewedImageId');
