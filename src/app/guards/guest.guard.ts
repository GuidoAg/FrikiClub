import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';

export const guestGuard: CanActivateFn = async (): Promise<
  boolean | UrlTree
> => {
  const userService = inject(UserService);
  const router = inject(Router);

  await userService.loadUserData();

  const user = userService.getCurrentUser();
  return user ? router.createUrlTree(['/home']) : true;
};
