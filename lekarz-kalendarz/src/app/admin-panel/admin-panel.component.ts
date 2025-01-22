import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent {
  bannedUsers: string[] = [];

  constructor(private afAuth: AngularFireAuth) {}

  banUser(email: string): void {
    if (!this.bannedUsers.includes(email)) {
      this.bannedUsers.push(email);
      console.log(`User ${email} banned.`);
    }
  }

  setPersistence(persistence: 'local' | 'session' | 'none'): void {
    this.afAuth.setPersistence(persistence).then(() => {
      console.log(`Persistence set to ${persistence}`);
    });
  }
}
