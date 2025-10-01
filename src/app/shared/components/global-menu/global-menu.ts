import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GlobalMenuService } from '../../../services/global-menu';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-global-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-menu.html',
  styleUrls: ['./global-menu.css']
})
export class GlobalMenuComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  currentRoute: string = '';
  private menuSubscription!: Subscription;
  private routerSubscription!: Subscription;

  constructor(
    private router: Router, 
    private globalMenuService: GlobalMenuService
  ) {}

  ngOnInit() {
    // Escuta as mudanças do estado do menu
    this.menuSubscription = this.globalMenuService.isMenuOpen$.subscribe(
      isOpen => {
        this.isMenuOpen = isOpen;
      }
    );

    // Escuta as mudanças de rota
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
      });

    // Define a rota inicial
    this.currentRoute = this.router.url;
  }

  toggleMenu() {
    this.globalMenuService.toggleMenu();
  }

  closeMenu() {
    this.globalMenuService.closeMenu();
  }

  navigate(route: string) {
    this.router.navigate([`/${route}`]);
    this.closeMenu();
  }

  // Verifica se a rota está ativa
  isActive(route: string): boolean {
    return this.currentRoute === `/${route}` || 
           this.currentRoute.startsWith(`/${route}/`);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Escape' && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  onMenuClick(event: Event) {
    event.stopPropagation();
  }

  ngOnDestroy() {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}