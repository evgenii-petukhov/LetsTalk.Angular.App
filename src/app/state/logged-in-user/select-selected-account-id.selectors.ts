import { createFeatureSelector } from "@ngrx/store";
import { AccountDto } from "src/app/api-client/api-client";

export const selectLoggedInUser = createFeatureSelector<AccountDto>('loggedInUser');