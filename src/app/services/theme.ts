// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.LIGHT_THEME ? this.DARK_THEME : this.LIGHT_THEME;
    this.setTheme(newTheme);
  }

  setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  getCurrentTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || this.LIGHT_THEME;
  }

  isDarkTheme(): boolean {
    return this.getCurrentTheme() === this.DARK_THEME;
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || this.LIGHT_THEME;
    this.setTheme(savedTheme);
  }
}