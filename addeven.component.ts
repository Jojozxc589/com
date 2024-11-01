import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addeven',
  templateUrl: './addeven.component.html',
  styleUrls: ['./addeven.component.scss']
})
export class AddevenComponent implements OnInit {
  eventForm: FormGroup;
  bookings: any[] = [];
  selectedEventCode: { [key: number]: string } = {};
  events: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.eventForm = this.fb.group({
      event_code: ['', Validators.required],
      event_name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBookings();
    this.loadEvents();
  }

  loadBookings(): void {
    this.http.get<any>('http://localhost/angular-webpro/getBookingsWithNullEvent')
      .subscribe(
        data => this.bookings = data,
        error => {
          console.error('Error loading bookings:', error);
          alert('ไม่สามารถโหลดข้อมูลการจองได้');
        }
      );
  }

  loadEvents(): void {
    this.http.get<any>('http://localhost/angular-webpro/getAllEvents1')
      .subscribe(
        data => this.events = data,
        error => {
          console.error('Error loading events:', error);
          alert('ไม่สามารถโหลดข้อมูลอีเวนต์ได้');
        }
      );
  }

  addNewEvent() {
    if (this.eventForm.valid) {
      this.http.post('http://localhost/angular-webpro/addEvent14', this.eventForm.value)
        .subscribe(
          response => {
            alert('เพิ่มอีเวนต์สำเร็จ!');
            this.loadEvents();
          },
          error => {
            console.error('Error adding event:', error);
            alert('ไม่สามารถเพิ่มอีเวนต์ได้');
          }
        );
    }
  }

  addEventCodeToBooking(bookingId: number) {
    const eventCode = this.selectedEventCode[bookingId];
    if (eventCode) {
      this.updateEventCode(bookingId, eventCode);
    } else {
      alert(`กรุณากรอก Event Code สำหรับ Booking ID: ${bookingId}`);
    }
  }

  updateEventCode(bookingId: number, eventCode: string): void {
    const body = { booking_id: bookingId, event_code: eventCode };
    this.http.post('http://localhost/angular-webpro/updateEventCode', body)
      .subscribe(
        response => alert(`อัปเดต Booking ID: ${bookingId} ด้วย Event Code: ${eventCode} สำเร็จ`),
        error => {
          console.error('Error updating event code:', error);
          alert('ไม่สามารถอัปเดต Event Code ได้');
        }
      );
  }
  goBack() {
    // ลำดับการนำทางกลับ
    window.history.back();
}
}
