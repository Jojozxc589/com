import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sumbitbooth',
  templateUrl: './sumbitbooth.component.html',
  styleUrls: ['./sumbitbooth.component.scss']
})
export class SumbitboothComponent implements OnInit {
  bookingId: string = '';
  responseMessage: string = '';
  bookingList: any[] = []; // ตัวแปรสำหรับเก็บลิสต์การจอง

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchBookingList(); // เรียกฟังก์ชันเพื่อดึงข้อมูลในช่วงเริ่มต้น
  }

  fetchBookingList() {
    const url = 'http://localhost/angular-webpro/getBookings'; // URL สำหรับดึงข้อมูล booking
    this.http.get<any[]>(url).subscribe(
      response => {
        this.bookingList = response; // เก็บข้อมูลในตัวแปร bookingList
      },
      error => {
        this.responseMessage = 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง';
      }
    );
  }

  onSubmit() {
    const url = 'http://localhost/angular-webpro/approveBooking22'; // เปลี่ยน URL ให้ตรงกับที่อยู่ของ API

    this.http.post<any>(url, { booking_id: this.bookingId }).subscribe(
      response => {
        this.responseMessage = response.success || response.error;
      },
      error => {
        this.responseMessage = 'เกิดข้อผิดพลาดในการส่งข้อมูล';
      }
    );
  }

  goBack() {
    // ลำดับการนำทางกลับ
    window.history.back();
  }
}
