import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('teachertech_token') : null)
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('teachertech_token') : null);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
        if (typeof localStorage !== 'undefined') localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
