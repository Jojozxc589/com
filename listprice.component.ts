import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common'; // นำเข้า Location

@Component({
  selector: 'app-listprice',
  templateUrl: './listprice.component.html',
  styleUrls: ['./listprice.component.scss']
})
export class ListpriceComponent implements OnInit {
  unpaidBookings: any[] = [];
  paidBookings: any[] = [];
  pendingReviews: any[] = [];
  bookedBooths: any[] = []; // ตัวแปรใหม่สำหรับข้อมูลบูธที่ถูกจอง
  viewMode: string = 'unpaid'; // ค่าเริ่มต้นแสดงผู้ที่ยังไม่จ่าย

  constructor(private authService: AuthService, private location: Location) {} // เพิ่ม Location ที่นี่

  ngOnInit(): void {
    this.getUnpaidBookings();
    this.getPaidBookings();
    this.getPendingReviews();
    this.getBookedBooths(); // เรียกใช้งานฟังก์ชันใหม่
  }

  getUnpaidBookings(): void {
    this.authService.getUnpaidBookings().subscribe(
      (data) => {
        this.unpaidBookings = data;
      },
      (error) => {
        console.error('Error fetching unpaid bookings:', error);
      }
    );
  }

  getPaidBookings(): void {
    this.authService.getPaidBookings().subscribe(
      (data) => {
        this.paidBookings = data;
      },
      (error) => {
        console.error('Error fetching paid bookings:', error);
      }
    );
  }

  getPendingReviews(): void {
    this.authService.getPendingReviews().subscribe(
      (data) => {
        this.pendingReviews = data;
      },
      (error) => {
        console.error('Error fetching pending reviews:', error);
      }
    );
  }

  getBookedBooths(): void {
    this.authService.getBookedBooths().subscribe(
      (data) => {
        this.bookedBooths = data;
      },
      (error) => {
        console.error('Error fetching booked booths:', error);
      }
    );
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  goBack(): void {
    this.location.back(); // ใช้งาน Location ที่นำเข้ามา
  }
}
