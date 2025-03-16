import { createFeatureSelector } from '@ngrx/store';
import { ImageKey } from 'src/app/models/image-key';

export const selectViewedImageKey =
    createFeatureSelector<ImageKey>('viewedImageKey');
