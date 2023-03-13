import { createFeatureSelector } from "@ngrx/store";
import { Message } from "src/app/models/message";

export const selectMessages = createFeatureSelector<ReadonlyArray<Message>>('messages');