import { Injectable } from '@angular/core';
import { RequestLoggingService } from '../services/request-logging.service';

@Injectable()
export class GrpcLogInterceptor {
    constructor(private requestLoggingService: RequestLoggingService) { }

    async intercept(request: { f: { array: string | any[]; }; c: { name: any; }; }, invoker: (arg0: any) => Promise<any>) {
        const t0 = performance.now();
        const response = await invoker(request);
        const downloaded = response.c.array && response.c.array.length && response.c.array[0].length ? response.c.array[0].length : 0;
        const uploaded = request.f.array && request.f.array.length && request.f.array[0].length ? request.f.array[0].length : 0;
        this.requestLoggingService.log('gRPC', request.c.name, performance.now() - t0, downloaded, uploaded);
        return response;
    };
}
