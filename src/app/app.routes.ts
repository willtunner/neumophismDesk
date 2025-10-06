import { Routes } from '@angular/router';
import { Login } from './public/login/login';
import { Home } from './private/home/home';
import { Profile } from './private/profile/profile';
import { ChatComponent } from './private/chat/chat';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home},
  { path: 'profile', component: Profile},
  { path: 'chat', component: ChatComponent},
  { path: '**', redirectTo: '/login' }
];