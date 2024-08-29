import { GRPC_INTERCEPTORS } from '@ngx-grpc/core';
import { GrpcLogInterceptor } from '../interceptors/grpc-log.interceptor';

export const grpcLogInterceptorProvider = [
    { provide: GRPC_INTERCEPTORS, useClass: GrpcLogInterceptor, multi: true },
];
