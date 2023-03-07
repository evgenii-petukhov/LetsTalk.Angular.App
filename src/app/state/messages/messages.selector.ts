import { createFeatureSelector } from "@ngrx/store";
import { IMessageDto } from "src/app/api-client/api-client";

export const selectMessages = createFeatureSelector<ReadonlyArray<IMessageDto>>('messages');