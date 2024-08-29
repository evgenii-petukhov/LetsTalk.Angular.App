import { createFeatureSelector } from '@ngrx/store';
import { ILayoutSettings } from '../../models/layout-settings';

export const selectLayoutSettings =
    createFeatureSelector<ILayoutSettings>('layoutSettings');
