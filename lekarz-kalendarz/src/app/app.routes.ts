import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { CalendarComponent } from './calendar/calendar.component'; // Import CalendarComponent
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] }, // Zabezpieczony widok
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Domyślne przekierowanie
  { path: '**', redirectTo: 'login' }, // Przekierowanie dla nieznanych ścieżek
];
