import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModuleKey, Permission } from '../models/models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser() ? true : router.parseUrl('/login');
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser() ? router.parseUrl(auth.defaultRoute()) : true;
};

export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.parseUrl(auth.defaultRoute());
};

export function moduleGuard(module: ModuleKey): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.currentUser()) return router.parseUrl('/login');
    return auth.hasAccess(module) ? true : router.parseUrl(auth.defaultRoute());
  };
}

export function permissionGuard(permission: Permission): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.currentUser()) return router.parseUrl('/login');
    return auth.can(permission) ? true : router.parseUrl(auth.defaultRoute());
  };
}
