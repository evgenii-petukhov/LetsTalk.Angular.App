import { createFeatureSelector } from "@ngrx/store";
import { AccountDto } from "../../api-client/api-client";

export const selectSelectedAccount = createFeatureSelector<AccountDto>('selectedAccount');