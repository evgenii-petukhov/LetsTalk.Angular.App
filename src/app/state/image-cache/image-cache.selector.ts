import { createFeatureSelector } from '@ngrx/store';
import { ImageCacheEntry } from 'src/app/models/image-cache-entry';

export const selectImageCache = createFeatureSelector<readonly ImageCacheEntry[]>('imageCache');
