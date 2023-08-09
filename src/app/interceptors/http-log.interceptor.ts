import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, filter, tap } from 'rxjs';

@Injectable()
export class HttpLogInterceptor implements HttpInterceptor {
    intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        const t0 = performance.now();
        return next.handle(request).pipe(filter(response => response instanceof HttpResponse), tap((response: HttpResponse<T>) => {
            const downloaded = response.body && response.body instanceof Blob ? ` ▼${(response.body.size / 1024).toFixed()}kB` : '';
            const uploaded = request.body && typeof request.body === 'string' ? ` ▲${(request.body.length / 1024).toFixed()}kB` : '';
            console.log(`[${request.method}] ${request.url} ${(performance.now() - t0).toFixed(0)}ms${downloaded}${uploaded}`);
        }));
    }
}
