import { createFeatureSelector } from '@ngrx/store';
import { IImageDto } from 'src/app/api-client/api-client';

export const selectViewedImageKey =
    createFeatureSelector<IImageDto>('viewedImageKey');
