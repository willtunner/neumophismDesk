import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GlobalMenuService } from '../../../services/global-menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-menu.html',
  styleUrls: ['./global-menu.css']
})
export class GlobalMenuComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  private menuSubscription!: Subscription;

  constructor(
    private router: Router, 
    private globalMenuService: GlobalMenuService
  ) {}

  ngOnInit() {
    this.menuSubscription = this.globalMenuService.isMenuOpen$.subscribe(
      isOpen => {
        this.isMenuOpen = isOpen;
      }
    );
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

  // CORREÇÃO FINAL - Método mais type-safe
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: Event) {
    // Verifica se é um KeyboardEvent e se a tecla é Escape
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
  }
}