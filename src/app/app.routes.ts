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

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home},
  { path: 'profile', component: Profile},
  { path: 'chat', component: ChatComponent},
  { path: 'companies', component: Companies},
  { path: 'call', component: Call},
  { path: 'clients', component: Clients},
  { path: 'calendar', component: Calendar},
  { path: 'tutorials', component: Tutorials},
  { path: 'notes', component: Notes},
  { path: '**', redirectTo: '/login' }
];