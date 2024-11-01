import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-checkbooth',
  templateUrl: './checkbooth.component.html',
  styleUrls: ['./checkbooth.component.scss']
})
export class CheckboothComponent {
  bookings: any[] = [];
  errorMessage: string = '';
  memberData: any = {};
  confirmationMessage: string = ''; // เพิ่มเพื่อเก็บข้อความยืนยันการยกเลิก

  constructor(private authService: AuthService, private location: Location, private route: Router) {
    this.loadBookings();
    this.getLoggedInMember();
  }

  loadBookings(): void {
    const memberData = this.authService.getMemberData();
    if (memberData && memberData.email) {
      const email = memberData.email;
      this.authService.showBookings(email).subscribe(
        (data) => {
          if (Array.isArray(data) && data.length) {
            this.bookings = data;
          } else {
            this.errorMessage = 'ไม่พบการจอง';
          }
        },
        () => {
          this.errorMessage = 'ไม่สามารถดึงข้อมูลการจองได้';
        }
      );
    } else {
      this.errorMessage = 'กรุณาล็อกอินก่อน';
    }
  }

  goBack(): void {
    this.location.back();
  }

  getLoggedInMember(): void {
    const data = this.authService.getMemberData();
    if (data && Object.keys(data).length > 0) {
      this.memberData = data;
      console.log('Member Data:', this.memberData);
    } else {
      this.memberData = {};
      console.error('No member data found');
    }
  }

  hasMemberData(): boolean {
    return this.memberData && Object.keys(this.memberData).length > 0;
  }

  goToReserve(booth: any): void {
    // อัปเดตวันที่การจอง
    this.authService.updateBookingDate(booth.booking_id).subscribe(
        (response: any) => {
            console.log('Booking date updated:', response);
            // นำทางไปยังหน้าชำระเงินหลังจากอัปเดตเสร็จ
            this.route.navigate(['/mainprice/pricebooth'], {
                queryParams: {
                    bookingID: booth.booking_id,
                    boothCode: booth.booth_code,
                    boothName: booth.booth_name,
                    projectName: booth.project_name,
                    size: booth.size,
                    status: booth.status,
                    price: booth.price,
                    info: booth.booth_info,
                    projectId: booth.project_id,
                    boothIds: JSON.stringify([booth.booth_id])
                }
            });
        },
        (error) => {
            console.error('Error updating booking date:', error); // แสดงข้อผิดพลาด
            this.errorMessage = 'ไม่สามารถอัปเดตวันที่การจองได้';
        }
    );
}
  // ฟังก์ชันใหม่สำหรับการยกเลิกการจอง
  confirmCancellation(booking: any): void {
    const confirmed = confirm(`คุณต้องการยกเลิกการจองบูธ: ${booking.booth_name}?`);
    if (confirmed) {
      this.authService.cancelBooking(booking.booking_id).subscribe(
        (response: any) => {
          console.log('Cancellation response:', response); 
          this.confirmationMessage = 'ยกเลิกการจองสำเร็จ';
          this.loadBookings();
        },
        (error: any) => {
          console.error('Cancellation error:', error); 
          this.errorMessage = 'ไม่สามารถยกเลิกการจองได้';
        }
      );
    }
  }
  
}
