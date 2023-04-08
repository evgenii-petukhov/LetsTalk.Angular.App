import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../helpers/auth.interceptor';

export const authInterceptorProvider = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
