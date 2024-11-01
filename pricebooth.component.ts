import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricebooth',
  templateUrl: './pricebooth.component.html',
  styleUrls: ['./pricebooth.component.scss']
})
export class PriceboothComponent {
  memberData: any = {};
  booking: any;
  errorMessage: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;
  paymentProofUrl: string = ''; // ประกาศตัวแปร paymentProofUrl ที่นี่

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.getBookingData();
  }

  ngOnInit(): void {
    this.getLoggedInMember();
  }

  getBookingData(): void {
    this.route.queryParams.subscribe(params => {
      this.booking = {
        bookingID: params['bookingID'],
        projectName: params['projectName'],
        boothName: params['boothName'],
        size: params['size'],
        info: params['info'],
        price: params['price']
      };
    });
  }

  goBack(): void {
    this.loading = true; 
    const bookingId = this.booking.bookingID;

    this.http.post('http://localhost/angular-webpro/updateBookingDate121', { booking_id: bookingId }).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          this.location.back();
        } else {
          this.errorMessage = 'ไม่สามารถย้อนกลับได้';
        }
      },
      error => {
        this.loading = false;
        this.errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
      }
    );
  }

  confirmPayment(): void {
    // ตรวจสอบว่ามีการกรอก URL หรือไม่
    if (this.paymentProofUrl) {
      this.loading = true; // แสดงสถานะโหลด

      // สร้าง payload สำหรับการส่งข้อมูล
      const payload = {
        booking_id: this.booking.bookingID,
        payment_proof_url: this.paymentProofUrl // ใช้ URL ที่กรอก
      };

      this.http.post('http://localhost/angular-webpro/updateBookingStatus10', payload).subscribe(
        (response: any) => {
          this.loading = false; // ซ่อนสถานะโหลด
          if (response.success) {
            if (response.message === 'ชำระแล้ว') {
 
              this.router.navigate(['maincheck/checkbooth']); 
            } else {
              this.errorMessage = response.message; // แสดงข้อความผิดพลาด
            }
          } else {
            this.router.navigate(['maincheck/checkbooth']); 
          }
        },
        error => {
          this.loading = false; // ซ่อนสถานะโหลดเมื่อเกิดข้อผิดพลาด
          console.error('Error confirming payment:', error); 
          this.errorMessage = error.error?.message || 'ไม่สามารถยืนยันการชำระเงินได้'; // แสดงข้อความผิดพลาด
        }
      );
    } else {
      this.errorMessage = 'กรุณากรอก URL สลิปการชำระเงิน';
    }
  }

  getLoggedInMember(): void {
    const data = this.authService.getMemberData();
    if (data && Object.keys(data).length > 0) {
      this.memberData = data;
    } else {
      console.error('No member data found');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }
}
