import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  formData = {
    fullName: '',
    email: '',
    age: null as number | null,
    country: '',
    bio: '',
    newsletter: false,
    terms: false,
    notifications: true,
    gender: '',
    volume: 50,
    brightness: 75,
    darkMode: false,
    autoSave: true,
    publicProfile: false
  };

  constructor(private router: Router, private themeService: ThemeService) {}

  submitForm() {
    console.log('Form submitted:', this.formData);
    alert('Form data saved! Check console for details.');
  }

  resetForm() {
    this.formData = {
      fullName: '',
      email: '',
      age: null,
      country: '',
      bio: '',
      newsletter: false,
      terms: false,
      notifications: true,
      gender: '',
      volume: 50,
      brightness: 75,
      darkMode: false,
      autoSave: true,
      publicProfile: false
    };
    console.log('Form reset');
  }

  showAlert() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested!');
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.formData.darkMode = this.themeService.isDarkTheme();
  }
}