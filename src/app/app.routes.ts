import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'confirmacion',
    loadComponent: () =>
      import('./components/confirmacion/confirmacion.component').then(
        (m) => m.ConfirmacionComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (m) => m.HomeComponent
          ),
        canActivate: [authGuard],
        children: [
          {
            path: 'busca-minas',
            loadComponent: () =>
              import('./components/busca-minas/busca-minas.component').then(
                (m) => m.BuscaMinasComponent
              ),
          },
          {
            path: 'ahorcado',
            loadComponent: () =>
              import('./components/ahorcado/ahorcado.component').then(
                (m) => m.AhorcadoComponent
              ),
          },
        ],
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./components/chat/chat.component').then(
            (m) => m.ChatComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'quien-soy',
        loadComponent: () =>
          import('./components/quien-soy/quien-soy.component').then(
            (m) => m.QuienSoyComponent
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
