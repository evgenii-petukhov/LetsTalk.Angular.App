import { Injectable } from '@angular/core';
import { RequestLoggingService } from '../services/request-logging.service';

@Injectable()
export class GrpcLogInterceptor {
    constructor(private requestLoggingService: RequestLoggingService) { }

    async intercept<T extends { f: { array: string[] }; c: { name: string; } }, R extends { c: { array: Uint8Array[] } }>(
        request: T,
        invoker: (arg0: T) => Promise<R>
    ): Promise<R> {
        const t0 = performance.now();
        const response = await invoker(request);
        const downloaded = response.c.array?.length && response.c.array[0].length ? response.c.array[0].length : 0;
        const uploaded = request.f.array?.length && request.f.array[0].length ? request.f.array[0].length : 0;
        this.requestLoggingService.log('gRPC', request.c.name, performance.now() - t0, downloaded, uploaded);
        return response;
    }
}
