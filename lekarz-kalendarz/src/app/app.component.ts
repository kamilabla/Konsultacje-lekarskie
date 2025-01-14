// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { Auth, authState } from '@angular/fire/auth';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css'],
//   imports: [CommonModule, RouterModule],
// })
// export class AppComponent {
//   user: Observable<any>;

//   constructor(private auth: Auth) {
//     this.user = authState(this.auth); // Użyj strumienia authState z Auth
//   }
// }

import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class AppComponent {
  user$: Observable<any>;

  constructor(private auth: Auth) {
    this.user$ = new Observable((observer) => {
      this.auth.onAuthStateChanged(observer);
    });
  }

  async logout() {
    await this.auth.signOut();
  }
}

