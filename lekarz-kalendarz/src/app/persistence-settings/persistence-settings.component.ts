import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-persistence-settings',
  standalone: true,
  templateUrl: './persistence-settings.component.html',
  styleUrls: ['./persistence-settings.component.css'],
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule

})
export class PersistenceSettingsComponent {
  persistenceOptions = [
    { label: 'LOCAL (Default)', value: 'local' },
    { label: 'SESSION', value: 'session' },
    { label: 'NONE', value: 'none' },
  ];

  selectedPersistence = 'local'; // Default value
  message = '';

  constructor(private afAuth: AngularFireAuth) {}

  async updatePersistence() {
    try {
      await this.afAuth.setPersistence(this.selectedPersistence);
      this.message = `Persistence set to: ${this.selectedPersistence.toUpperCase()}`;
    } catch (error: any) {
      console.error('Error updating persistence:', error.message || error);
      this.message = 'Error updating persistence.';
    }
  }
}
