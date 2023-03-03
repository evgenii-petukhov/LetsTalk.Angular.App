import { createFeatureSelector } from "@ngrx/store";
import { Message } from "../models/rendering/message";

export const selectMessages = createFeatureSelector<Array<Message>>('messages');