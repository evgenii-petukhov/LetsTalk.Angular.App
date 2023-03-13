import { AutoMap } from "@automapper/classes";

export class Message {
    @AutoMap()
    id?: number;

    @AutoMap()
    text?: string | undefined;

    @AutoMap()
    accountId?: number;

    @AutoMap()
    isMine?: boolean;

    @AutoMap()
    created?: Date;
}