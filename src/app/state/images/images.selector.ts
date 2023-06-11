import { createFeatureSelector } from '@ngrx/store';
import { Image } from 'src/app/models/image';

export const selectImages = createFeatureSelector<readonly Image[]>('images');
