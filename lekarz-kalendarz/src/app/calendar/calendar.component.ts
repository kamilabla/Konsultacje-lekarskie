import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  days = this.generateWeek(); // Generowanie dni tygodnia
  hours: string[] = []; // Tablica godzin
  currentWeek = new Date().toLocaleDateString(); // Bieżący tydzień w czytelnym formacie

  constructor() {
    this.generateHours(); // Wygenerowanie godzin podczas inicjalizacji
  }

  generateWeek() {
    const week = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - today.getDay() + i);

      week.push({
        date,
        consultations: [],
        slots: this.generateSlots(date),
      });
    }

    return week;
  }

  generateSlots(date: Date) {
    const slots = [];
    for (let i = 9; i < 15; i += 0.5) {
      slots.push({
        time: i,
        reserved: Math.random() > 0.7,
        type: Math.random() > 0.5 ? 'konsultacja' : 'wizytacja',
        details: `Slot ${i} - Szczegóły`,
      });
    }
    return slots;
  }

  generateHours() {
    const startHour = 9; // Godzina startowa
    const endHour = 15; // Godzina końcowa
    const interval = 0.5; // Interwał w godzinach (30 minut)

    for (let hour = startHour; hour <= endHour; hour += interval) {
      const fullHour = Math.floor(hour);
      const minutes = hour % 1 === 0 ? '00' : '30';
      this.hours.push(`${fullHour}:${minutes}`);
    }
  }

  getConsultationColor(type: string): string {
    return type === 'konsultacja' ? 'lightblue' : 'lightgreen';
  }

  isPast(date: Date, time: number): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(Math.floor(time), (time % 1) * 60);
    return slotTime < now;
  }

  isCurrent(date: Date, time: number): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(Math.floor(time), (time % 1) * 60);
    return (
      slotTime.getDate() === now.getDate() &&
      slotTime.getHours() === now.getHours()
    );
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  prevWeek() {
    console.log('Poprzedni tydzień');
  }

  nextWeek() {
    console.log('Następny tydzień');
  }

  showDetails(slot: any) {
    console.log('Pokaż szczegóły:', slot.details);
  }

  hideDetails() {
    console.log('Ukryj szczegóły');
  }
}
