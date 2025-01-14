import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Dodaj FormsModule
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from '@angular/fire/firestore';
import { ChangeDetectorRef } from '@angular/core';




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

  showBookingForm: boolean = false; // Widoczność formularza rezerwacji
  selectedSlot: any = null; // Wybrany slot do rezerwacji
  booking = {
    duration: 0.5,
    type: '',
    name: '',
    gender: '',
    age: 0,
    notes: '',
  };

  constructor(private firestore: Firestore,  private cdr: ChangeDetectorRef) {
    this.generateHours(); // Wygenerowanie godzin podczas inicjalizacji
    this.fetchConsultationsFromFirebase(); // Pobierz dane na starcie
    this.fetchAvailabilityFromFirebase(); // Pobranie dostępności
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
      const timeString = this.convertDecimalToTime(i); // Konwersja na hh:mm
      slots.push({
        time: timeString, // Zapis jako string
        reserved: false,
        type: '',
        details: '',
        status: '', // Dodano status
        name: '',   // Nowe pole
        gender: '', // Nowe pole
        age: null,  // Nowe pole
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

  openBookingForm(slot: any, day: any) {
    this.selectedSlot = slot;

    // Sprawdź, czy slot jest dostępny
    if (!this.isAvailable(day.date, slot.time)) {
      console.error('Wybrany slot nie jest dostępny!');
      return;
    }

    this.showBookingForm = true; // Pokaż formularz rezerwacji
  }

  cancelBooking() {
    this.showBookingForm = false;
    this.selectedSlot = null;
  }

  async submitBooking() {
    if (!this.selectedSlot || !this.booking) {
      console.error('Nie wybrano slotu lub brak danych rezerwacji!');
      return;
    }
  
    const day = this.days.find((d) => d.slots.includes(this.selectedSlot));
  
    if (!day) {
      console.error('Nie znaleziono dnia dla wybranego slotu!');
      return;
    }
  
    const slotIndex = day.slots.indexOf(this.selectedSlot);
    const slotsToCheck = Math.ceil(this.booking.duration / 0.5);
  
    for (let i = slotIndex; i < slotIndex + slotsToCheck; i++) {
      if (
        i >= day.slots.length ||
        day.slots[i].reserved ||
        !this.isAvailable(day.date, day.slots[i].time)
      ) {
        console.error('Nie można zarezerwować, brak ciągłości dostępnych slotów!');
        return;
      }
    }
  
    for (let i = slotIndex; i < slotIndex + slotsToCheck; i++) {
      day.slots[i].reserved = true;
      day.slots[i].type = this.booking.type;
      day.slots[i].details = `Konsultacja: ${this.booking.type}, ${this.booking.name}`;
    }
  
    const consultation = {
      date: day.date,
      startTime: this.selectedSlot.time, // Przekazujemy time jako string
      duration: this.booking.duration,
      type: this.booking.type,
      name: this.booking.name,
      gender: this.booking.gender,
      age: this.booking.age,
      notes: this.booking.notes,
    };
  
    await this.addConsultationToFirebase(consultation); // Zapis do Firebase
    console.log('Konsultacja zarezerwowana!');
    this.cancelBooking();
  }
  

  

  isAvailable(date: Date, time: string): boolean {
    const dateString = date.toISOString().split('T')[0]; // Format yyyy-MM-dd
    const dayAvailability = this.availability[dateString];
  
    if (!dayAvailability) {
      return false;
    }
  
    const timeDecimal = this.convertTimeToDecimal(time); // Konwersja hh:mm na liczbę dziesiętną
    return dayAvailability.some(
      (range) => timeDecimal >= range.start && timeDecimal < range.end
    );
  }
  


  getConsultationColor(type: string): string {
    return type === 'konsultacja' ? 'lightblue' : 'lightgreen';
  }

  isPast(date: Date, time: string): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    const timeDecimal = this.convertTimeToDecimal(time); // Konwersja hh:mm na liczbę dziesiętną
    slotTime.setHours(Math.floor(timeDecimal), (timeDecimal % 1) * 60);
    return slotTime < now;
  }
  

  isCurrent(date: Date, time: string): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    const timeDecimal = this.convertTimeToDecimal(time); // Konwersja hh:mm na liczbę dziesiętną
    slotTime.setHours(Math.floor(timeDecimal), (timeDecimal % 1) * 60);
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
          slot.status = 'Odwołana'; // Nowa właściwość statusu
          slot.details = `${slot.details} (odwołana z powodu nieobecności lekarza)`;
        }
      });
    }
  }

  isAbsent(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.absences.includes(dateString);
  }


  openSlotDetails(slot: any) {
    if (slot.reserved) {
      this.selectedSlot = slot;
    }
  }

  async cancelReservation() {
    if (this.selectedSlot) {
      const consultationId = this.selectedSlot.firebaseId; // Załóżmy, że firebaseId jest przypisane do slotu
      await this.deleteConsultationFromFirebase(consultationId); // Usuń z Firebase
      this.selectedSlot.reserved = false;
      this.selectedSlot.details = '';
      this.selectedSlot.type = null;
      this.selectedSlot = null;
      this.showBookingForm = false;
      console.log('Rezerwacja została odwołana.');
    } else {
      console.error('Nie wybrano żadnej rezerwacji do odwołania.');
    }
  }
  


  async testFirebase() {
    console.log('Test Firebase uruchomiony');
    try {
      const testCollection = collection(this.firestore, 'testCollection');
      const docRef = await addDoc(testCollection, {
        message: 'Firebase działa!',
        timestamp: new Date(),
      });
      console.log('Dodano dokument z ID:', docRef.id);
    } catch (error) {
      console.error('Błąd podczas dodawania dokumentu:', error);
    }
  }
  
  
  
  
  
  async addConsultationToFirebase(consultation: any) {
    try {
      const consultationCollection = collection(this.firestore, 'consultations');
      const docRef = await addDoc(consultationCollection, consultation);
      console.log('Konsultacja dodana z ID:', docRef.id);
    } catch (error) {
      console.error('Błąd podczas dodawania konsultacji:', error);
    }
  }

  async fetchConsultationsFromFirebase() {
    try {
      const consultationCollection = collection(this.firestore, 'consultations');
      const querySnapshot = await getDocs(consultationCollection);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        if (data['date'] && data['date'].toDate) {
          const consultationDate = data['date'].toDate(); // Konwersja Timestamp na Date
          const day = this.days.find(
            (d) =>
              d.date.toISOString().split('T')[0] ===
              consultationDate.toISOString().split('T')[0]
          );
  
          if (day) {
            // Przypisanie do odpowiedniego slotu
            const slotIndex = day.slots.findIndex(
              (slot) => slot.time === data['startTime'] // Porównanie z użyciem string
            );
  
            if (slotIndex !== -1) {
              day.slots[slotIndex].reserved = true;
              day.slots[slotIndex].type = data['type'];
              day.slots[slotIndex].details = data['notes'];
              day.slots[slotIndex]['name'] = data['name'];
              day.slots[slotIndex]['gender'] = data['gender'];
              day.slots[slotIndex]['age'] = data['age'];
            }
          }
        } else {
          console.error(
            `Pole "date" jest niepoprawne w dokumencie ${doc.id}:`,
            data
          );
        }
      });
    } catch (error) {
      console.error('Błąd podczas pobierania konsultacji:', error);
    }
  }
  
  async updateConsultationInFirebase(id: string, updatedData: any) {
    try {
      const consultationDoc = doc(this.firestore, 'consultations', id);
      await updateDoc(consultationDoc, updatedData);
      console.log('Konsultacja zaktualizowana:', id);
    } catch (error) {
      console.error('Błąd podczas aktualizacji konsultacji:', error);
    }
  }

  async deleteConsultationFromFirebase(id: string) {
    try {
      const consultationDoc = doc(this.firestore, 'consultations', id);
      await deleteDoc(consultationDoc);
      console.log('Konsultacja usunięta:', id);
    } catch (error) {
      console.error('Błąd podczas usuwania konsultacji:', error);
    }
  }
  
  convertTimeToDecimal(time: string): number {
    if (typeof time !== 'string') {
      console.error('Niepoprawny format czasu:', time);
      return NaN;
    }
  
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }


  async addAvailabilityToFirebase() {
    if (!this.selectedDate || this.startHour >= this.endHour) {
      console.error('Nieprawidłowe dane dostępności!');
      return;
    }
  
    const slots = this.generateSlotsFromRange(
      this.convertDecimalToTime(this.startHour),
      this.convertDecimalToTime(this.endHour)
    );
  
    const availability = {
      doctorId: '12345', // Możesz to dynamicznie przypisać
      date: new Date(this.selectedDate),
      startTime: this.convertDecimalToTime(this.startHour),
      endTime: this.convertDecimalToTime(this.endHour),
      slots: slots,
    };
  
    try {
      const availabilityCollection = collection(this.firestore, 'availability');
      const docRef = await addDoc(availabilityCollection, availability);
      console.log('Dostępność dodana z ID:', docRef.id);
    } catch (error) {
      console.error('Błąd podczas dodawania dostępności:', error);
    }
  }

  async fetchAvailabilityFromFirebase() {
    try {
      const availabilityCollection = collection(this.firestore, 'availability');
      const querySnapshot = await getDocs(availabilityCollection);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        // Upewnij się, że istnieje pole `date` i jest w poprawnym formacie
        if (data['date'] && data['date'].toDate) {
          const availabilityDate = data['date'].toDate(); // Konwersja Firebase Timestamp na Date
          const day = this.days.find(
            (d) =>
              d.date.toISOString().split('T')[0] ===
              availabilityDate.toISOString().split('T')[0]
          );
  
          if (day) {
            // Aktualizacja slotów na podstawie dostępności z Firebase
            const slotsFromFirebase = data['slots'] || [];
            console.log('Sloty z Firebase:', slotsFromFirebase);

            day.slots.forEach((slot) => {
              const matchingSlot = slotsFromFirebase.find(
                (firebaseSlot: any) => firebaseSlot.time === slot.time
              );
              if (matchingSlot) {
                console.log('Przypisywanie slotu:', matchingSlot);
                slot.reserved = matchingSlot.reserved;
                slot.details = matchingSlot.details || '';
              }
            });
          }
          if (!day) {
            console.error('Nie znaleziono dnia w kalendarzu dla dostępności:', data);
            return;
          }

          console.log('Pobrana dostępność:', data);
          this.cdr.detectChanges(); // Wymuszenie odświeżenia interfejsu
        } else {
          console.error(
            `Pole "date" jest niepoprawne w dokumencie ${doc.id}:`,
            data
          );
        }
      });
  
      console.log('Dostępność lekarza została załadowana.');
    } catch (error) {
      console.error('Błąd podczas pobierania dostępności:', error);
    }
  }
  
  

  generateSlotsFromRange(startTime: string, endTime: string): any[] {
    const slots = [];
    const start = this.convertTimeToDecimal(startTime);
    const end = this.convertTimeToDecimal(endTime);
  
    for (let time = start; time < end; time += 0.5) {
      const slotTime = this.convertDecimalToTime(time);
      slots.push({ time: slotTime, reserved: false, details: "" });
    }
    return slots;
  }

  convertDecimalToTime(decimalTime: number): string {
    const hours = Math.floor(decimalTime); // Całkowita liczba godzin
    const minutes = (decimalTime % 1) * 60; // Pozostałe minuty
    const formattedHours = hours.toString().padStart(2, '0'); // Dodanie zera wiodącego
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Dodanie zera wiodącego
    return `${formattedHours}:${formattedMinutes}`;
  }
  
  
  
  
  
  
  

  
}
