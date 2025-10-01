import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalMenuComponent } from './shared/components/global-menu/global-menu';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    Header,
    GlobalMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neumophismDesk');
}
