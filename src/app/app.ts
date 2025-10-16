import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { GlobalMenuComponent } from './shared/components/global-menu/global-menu';
import { Header } from './shared/components/header/header';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, GlobalMenuComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('neumophismDesk');
  protected readonly isLoginRoute = signal(false);
  
  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Verifica a rota inicial
    this.checkCurrentRoute();
    
    // Observa mudanças de rota
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.checkCurrentRoute();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkCurrentRoute() {
    const currentUrl = this.router.url;
    // Verifica se está na rota de login (pode ajustar conforme suas rotas)
    const isLogin = currentUrl.includes('/login') || 
                    currentUrl === '/login' || 
                    currentUrl.includes('/signup') || 
                    currentUrl === '/signup' ||
                    currentUrl.includes('/forgot-password') || 
                    currentUrl === '/forgot-password' ||
                    currentUrl.includes('/auth');
    
    this.isLoginRoute.set(isLogin);
  }
}