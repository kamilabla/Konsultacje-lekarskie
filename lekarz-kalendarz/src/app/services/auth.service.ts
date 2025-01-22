import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private mockRoles: { [email: string]: string[] } = {
    'admin@example.com': ['admin'],
    'doctor@example.com': ['doctor'],
    'kamilablaszczyna@gmail.com': ['patient'],
  };

  private userRoleSubject = new BehaviorSubject<string[]>([]);

  constructor(public afAuth: AngularFireAuth) {}

  // Observable for the authenticated user
  get userData(): Observable<any> {
    return this.afAuth.authState.pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    );
  }

  // Fetch roles for a given email
  fetchUserRoles(email: string | null): Observable<string[]> {
    if (!email) {
      console.warn('Email is null, returning empty roles.');
      return of([]);
    }

    const roles = this.mockRoles[email] || [];
    this.userRoleSubject.next(roles); // Update the current roles
    return of(roles).pipe(
      tap((roles) =>
        console.log(`Roles fetched for ${email}:`, roles.length > 0 ? roles : 'No roles found')
      )
    );
  }

  // Observable for user roles
  get userRoles$(): Observable<string[]> {
    return this.userRoleSubject.asObservable();
  }

  // Method to check if the user has a specific role
  hasRole(role: string): Observable<boolean> {
    return this.userRoles$.pipe(
      map((roles) => roles.includes(role)),
      tap((hasRole) =>
        console.log(`User has role "${role}":`, hasRole ? 'Yes' : 'No')
      )
    );
  }

  // Sign-out logic
  logout(): Promise<void> {
    return this.afAuth.signOut().then(() => {
      this.userRoleSubject.next([]); // Clear roles after logout
      console.log('User logged out and roles cleared.');
    });
  }
}
