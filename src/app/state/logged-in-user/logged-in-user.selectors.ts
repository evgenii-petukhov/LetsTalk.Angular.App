import { createFeatureSelector } from '@ngrx/store';
import { IProfileDto } from 'src/app/api-client/api-client';

export const selectLoggedInUser = createFeatureSelector<IProfileDto>('loggedInUser');
