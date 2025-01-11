import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Dodaj FormsModule


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  days = this.generateWeek(); // Generowanie dni tygodnia
  hours: string[] = []; // Tablica godzin
  currentWeek = new Date().toLocaleDateString(); // Bieżący tydzień w czytelnym formacie

  activeSlot: any = null; // Przechowywanie aktywnego slotu
  tooltipX = 0; // Pozycja X dla tooltipa
  tooltipY = 0; // Pozycja Y dla tooltipa

  availability: { [date: string]: { start: number; end: number }[] } = {}; // Dostępność na dzień
  selectedDate: string = ''; // Przechowuje wybraną datę
  startHour: number = 9; // Domyślna godzina początkowa
  endHour: number = 15; // Domyślna godzina końcowa

  absenceDate: string = ''; // Dla nieobecności
  absences: string[] = []; // Przechowuje daty nieobecności w formacie 'yyyy-MM-dd'

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
        details: `Szczegóły wizyty o ${Math.floor(i)}:${i % 1 === 0 ? '00' : '30'}`,
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

  
  showDetails(slot: any, event: MouseEvent) {
    this.activeSlot = slot;
    this.tooltipX = event.clientX + 2; // Pozycja X kursora
    this.tooltipY = event.clientY + 2; // Pozycja Y kursora
  }
  

  hideDetails() {
    this.activeSlot = null; // Ukrycie szczegółów wizyty
  }

  prevWeek() {
    console.log('Poprzedni tydzień');
  }

  nextWeek() {
    console.log('Następny tydzień');
  }



  setAvailability(date: Date, startHour: number, endHour: number) {
    const dateString = date.toISOString().split('T')[0]; // Format yyyy-MM-dd
    if (!this.availability[dateString]) {
      this.availability[dateString] = [];
    }
  
    this.availability[dateString].push({ start: startHour, end: endHour });
    console.log(`Dostępność ustawiona dla ${dateString}: ${startHour}-${endHour}`);
  }

  addAvailability() {
    if (!this.selectedDate || this.startHour >= this.endHour) {
      console.error('Nieprawidłowe dane dostępności!');
      return;
    }
  
    const date = new Date(this.selectedDate);
    this.setAvailability(date, this.startHour, this.endHour);
  }

  isAvailable(date: Date, time: number): boolean {
    const dateString = date.toISOString().split('T')[0]; // Format yyyy-MM-dd
    const dayAvailability = this.availability[dateString];
  
    if (!dayAvailability) {
      return false;
    }
  
    return dayAvailability.some(
      (range) => time >= range.start && time < range.end
    );
  }


  addAbsence(date: string) {
    if (!this.absences.includes(date)) {
      this.absences.push(date);
      this.handleConflictsForAbsence(date); // Sprawdź konflikty z konsultacjami
    }
  }
  
  handleConflictsForAbsence(date: string) {
    const day = this.days.find(d => d.date.toISOString().split('T')[0] === date);
    if (day) {
      day.slots.forEach(slot => {
        if (slot.reserved) {
          slot.reserved = false;
          slot.details = 'Odwołano wizytę z powodu nieobecności lekarza';
        }
      });
    }
  }

  isAbsent(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.absences.includes(dateString);
  }
  
  
  
  
}
