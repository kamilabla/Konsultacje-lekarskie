
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class AppComponent {
  user$: Observable<any>;

  constructor(private auth: Auth,  private router: Router) {
    this.user$ = new Observable((observer) => {
      this.auth.onAuthStateChanged(observer);
    });
  }

  async logout() {
    await this.auth.signOut();
    console.log("wylogowanooo");
    this.router.navigate(['/login']); // Automatyczne przeniesienie do logowania
  }
}

