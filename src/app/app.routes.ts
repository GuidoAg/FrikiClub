import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { adminGuard } from './guards/admin.guard';

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
            path: 'mayor-menor',
            loadComponent: () =>
              import('./components/mayor-menor/mayor-menor.component').then(
                (m) => m.MayorMenorComponent
              ),
          },
          {
            path: 'ahorcado',
            loadComponent: () =>
              import('./components/ahorcado/ahorcado.component').then(
                (m) => m.AhorcadoComponent
              ),
          },
          {
            path: 'preguntados',
            loadComponent: () =>
              import('./components/preguntados/preguntados.component').then(
                (m) => m.PreguntadosComponent
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
        path: 'ranking',
        loadComponent: () =>
          import('./components/ranking/ranking.component').then(
            (m) => m.RankingComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'encuesta',
        loadComponent: () =>
          import('./components/encuesta/encuesta.component').then(
            (m) => m.EncuestaComponent
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
      {
        path: 'resultado-encuesta',
        loadComponent: () =>
          import('./components/resultado-encuesta/resultado-encuesta.component').then(
            (m) => m.ResultadoEncuestaComponent
          ),
        canActivate: [adminGuard],
      },
    ],
  },
];
