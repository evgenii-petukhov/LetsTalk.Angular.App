import { Injectable } from '@angular/core';

@Injectable()
export class GrpcLogInterceptor {
    async intercept(request: { c: { name: any; }; }, invoker: (arg0: any) => Promise<any>) {
        const t0 = performance.now();
        const response = await invoker(request);
        console.log(`[gRPC] ${request.c.name} ${(performance.now() - t0).toFixed(0)}ms`);
        return response;
    };
}
