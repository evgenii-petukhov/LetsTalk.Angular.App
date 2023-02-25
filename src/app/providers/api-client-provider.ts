import { ApiClient } from "../services/api-client";

export const ApiClientProvider =
{
    provide: ApiClient,
    useClass: ApiClient
};