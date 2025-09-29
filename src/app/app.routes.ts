import { Routes } from '@angular/router';
import { Login } from './public/login/login';
import { Home } from './private/home/home';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home},
  { path: '**', redirectTo: '/login' }
];