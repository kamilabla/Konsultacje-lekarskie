import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule], // Dodajemy CommonModule i FormsModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private auth: Auth, private router: Router) {}

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('Zalogowano pomyślnie!');
      this.router.navigate(['/calendar']); // Przekierowanie po zalogowaniu
    } catch (error: any) {
      this.errorMessage = error.message || 'Błąd logowania.';
    }
  }
}
