import { createFeatureSelector } from "@ngrx/store";
import { IAccountDto } from "src/app/api-client/api-client";

export const selectAccounts = createFeatureSelector<ReadonlyArray<IAccountDto>>('accounts');