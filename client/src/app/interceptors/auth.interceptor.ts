import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUser = sessionStorage.getItem('currentUser');

  if (currentUser) {
    const user = JSON.parse(currentUser);
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Basic ${btoa(user.token + ':')}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
