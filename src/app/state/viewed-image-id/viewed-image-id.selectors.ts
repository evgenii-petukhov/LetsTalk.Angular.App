import { createFeatureSelector } from '@ngrx/store';

export const selectViewedImageId =
    createFeatureSelector<string>('viewedImageId');
