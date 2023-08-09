import { Injectable } from '@angular/core';

@Injectable()
export class GrpcLogInterceptor {
    async intercept(request: { f: { array: string | any[]; }; c: { name: any; }; }, invoker: (arg0: any) => Promise<any>) {
        const t0 = performance.now();
        const response = await invoker(request);
        const downloaded = response.c.array && response.c.array.length && response.c.array[0].length ? ' ▼' + (response.c.array[0].length / 1024).toFixed() + 'kB' : '';
        const uploaded = request.f.array && request.f.array.length && request.f.array[0].length ? ' ▲' + (request.f.array[0].length / 1024).toFixed() + 'kB' : '';
        console.log(`[gRPC] ${request.c.name} ${(performance.now() - t0).toFixed()}ms${downloaded}${uploaded}`);
        return response;
    };
}
