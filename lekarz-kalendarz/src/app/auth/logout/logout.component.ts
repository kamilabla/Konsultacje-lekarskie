import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-logout',
  standalone: true,
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  constructor(private auth: Auth) {}

  async logout() {
    await signOut(this.auth);
    alert('Wylogowanie zakończone sukcesem!');
  }
}
