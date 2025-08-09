import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users.component').then(
        (m) => m.UsersComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'adduser',
    loadComponent: () =>
      import('./components/add-user/add-user.component').then(
        (m) => m.AddUserComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'edituser/:userId',
    loadComponent: () =>
      import('./components/edit-user/edit-user.component').then(
        (m) => m.EditUserComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'changeuserpassword/:userId',
    loadComponent: () =>
      import('./components/change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./components/resources/resources.component').then(
        (m) => m.ResourcesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'addresource',
    loadComponent: () =>
      import('./components/add-resource/add-resource.component').then(
        (m) => m.AddResourceComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'editresource/:resourceId',
    loadComponent: () =>
      import('./components/edit-resource/edit-resource.component').then(
        (m) => m.EditResourceComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cards',
    loadComponent: () =>
      import('./components/cards/cards.component').then(
        (m) => m.CardsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'keycodes',
    loadComponent: () =>
      import('./components/keycodes/keycodes.component').then(
        (m) => m.KeycodesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'addkeycode',
    loadComponent: () =>
      import('./components/add-keycode/add-keycode.component').then(
        (m) => m.AddKeycodeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'editkeycode/:keycodeId',
    loadComponent: () =>
      import('./components/add-keycode/add-keycode.component').then(
        (m) => m.AddKeycodeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'editcard/:cardId',
    loadComponent: () =>
      import('./components/edit-card/edit-card.component').then(
        (m) => m.EditCardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./components/logs/logs.component').then((m) => m.LogsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/about/about.component').then(
        (m) => m.AboutComponent
      ),
    canActivate: [authGuard],
  },
];
