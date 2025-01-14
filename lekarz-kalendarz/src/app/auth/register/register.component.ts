import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
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
