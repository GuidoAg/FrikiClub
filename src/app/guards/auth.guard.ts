import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = async (): Promise<
  boolean | UrlTree
> => {
  const userService = inject(UserService);
  const router = inject(Router);

  await userService.loadUserData();

  const user = userService.getCurrentUser();
  if (user) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
