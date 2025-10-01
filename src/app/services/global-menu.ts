import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalMenuService {
  private isMenuOpenSubject = new BehaviorSubject<boolean>(false);
  isMenuOpen$ = this.isMenuOpenSubject.asObservable();

  toggleMenu() {
    this.isMenuOpenSubject.next(!this.isMenuOpenSubject.value);
  }

  closeMenu() {
    this.isMenuOpenSubject.next(false);
  }

  openMenu() {
    this.isMenuOpenSubject.next(true);
  }

  // Método para obter o estado atual
  getMenuState(): boolean {
    return this.isMenuOpenSubject.value;
  }
}