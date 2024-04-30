import { createFeatureSelector } from '@ngrx/store';
import { ILayoutSettngs } from '../../models/layout-settings';

export const selectLayoutSettings = createFeatureSelector<ILayoutSettngs>('layoutSettings');
