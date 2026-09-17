import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se não logado => redirect para /login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.currentUser();
  const role = user?.role?.toString().toUpperCase();
  const targetUrl = state.url || '';

  // Se user.role === 'STUDENT' e tenta acessar /professor/* => redirect para /meus-estudos
  if (role === 'STUDENT' && (targetUrl === '/professor' || targetUrl.startsWith('/professor/'))) {
    router.navigate(['/meus-estudos']);
    return false;
  }

  // Se role === 'PROFESSOR' e tenta /meus-estudos => redirect para /professor/estudio
  if (role === 'PROFESSOR' && (targetUrl === '/meus-estudos' || targetUrl.startsWith('/meus-estudos/'))) {
    router.navigate(['/professor/estudio']);
    return false;
  }

  return true;
};
