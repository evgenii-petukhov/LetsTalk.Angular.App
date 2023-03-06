import { createFeatureSelector } from "@ngrx/store";
import { ILayoutSettngs } from "./layout-settings";

export const selectLayoutSettings = createFeatureSelector<ILayoutSettngs>('layoutSettings');