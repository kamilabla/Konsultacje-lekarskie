import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule], // Dodano CommonModule
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  days = this.generateWeek();

  currentWeek = new Date().toLocaleDateString();

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
