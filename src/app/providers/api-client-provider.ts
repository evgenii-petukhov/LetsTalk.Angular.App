import { ApiClient } from '../api-client/api-client';

export const ApiClientProvider =
{
    provide: ApiClient,
    useClass: ApiClient
};
