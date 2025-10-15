import { Routes } from '@angular/router';
import { Login } from './public/login/login';
import { Home } from './private/home/home';
import { Profile } from './private/profile/profile';
import { ChatComponent } from './private/chat/chat';
import { Call } from './private/call/call';
import { Companies } from './private/companies/companies';
import { Clients } from './private/clients/clients';
import { Tutorials } from './private/tutorials/tutorials';
import { Notes } from './private/notes/notes';
import { Calendar } from './private/calendar/calendar';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'companies', component: Companies, canActivate: [authGuard] },
  { path: 'call', component: Call, canActivate: [authGuard] },
  { path: 'clients', component: Clients, canActivate: [authGuard]},
  { path: 'calendar', component: Calendar, canActivate: [authGuard] },
  { path: 'tutorials', component: Tutorials, canActivate: [authGuard]},
  { path: 'notes', component: Notes , canActivate: [authGuard]},
  { path: '**', redirectTo: '/login' }
];