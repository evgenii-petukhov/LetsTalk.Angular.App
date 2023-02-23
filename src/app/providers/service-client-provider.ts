import config from "../config";
import { Client } from "../services/service-client";

export const serviceClientProvider =
{
    provide: Client,
    useFactory: () => new Client(config.apiBaseUrl)
};