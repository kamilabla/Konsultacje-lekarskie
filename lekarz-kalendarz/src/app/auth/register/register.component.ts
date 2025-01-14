import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule], // Dodajemy CommonModule i FormsModule
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private auth: Auth, private router: Router) {}

  async register() {
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('Zarejestrowano pomyślnie!');
      this.router.navigate(['/calendar']); // Przekierowanie po rejestracji
    } catch (error: any) {
      this.errorMessage = error.message || 'Błąd rejestracji.';
    }
  }
}
