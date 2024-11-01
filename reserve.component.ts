import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss']
})
export class ReserveComponent implements OnInit {
  boothCode!: string;
  boothName!: string;
  size!: string;
  status!: string;
  price!: number;
  member_id: number | null = null; // ใช้เป็น null
  boothIds: string[] = []; // เก็บ booth_ids
  isPopupVisible: boolean = false; // สถานะของป๊อปอัพ
  isConfirmPopupVisible: boolean = false; // สถานะของป๊อปอัพยืนยันการจอง
  bookedBooths: any[] = []; // ข้อมูลบูธที่จอง
  memberData: any = {};

  constructor(private route: ActivatedRoute, private location: Location, private authService: AuthService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boothCode = params['boothCode'];
      this.boothName = params['boothName'];
      this.size = params['size'];
      this.status = params['status'];
      this.price = +params['price']; // แปลงเป็นตัวเลข
      this.boothIds = JSON.parse(params['boothIds']); // ดึง boothIds จาก params
      this.getLoggedInMember(); // เรียกข้อมูลสมาชิกที่ล็อกอิน
    });
  }

  openConfirmationPopup(): void {
    this.isConfirmPopupVisible = true; // เปิดป๊อปอัพยืนยัน
  }

  closeConfirmationPopup(): void {
    this.isConfirmPopupVisible = false; // ปิดป๊อปอัพยืนยัน
  }

  confirmBooking(): void {
    if (!this.member_id) {
      alert('Member ID is not available. Please login again.'); // แสดงข้อความเมื่อไม่มี member_id
      return;
    }

    const body = {
      member_id: this.member_id,
      booth_ids: this.boothIds // ใช้ booth_ids ที่ดึงมาจาก params
    };

    this.authService.reserveBooth(this.member_id, this.boothIds).subscribe(
      (response: any) => {
        this.bookedBooths = response.booked_booths; // เก็บข้อมูลบูธที่จอง
        alert('Booking successful: ' + response.success); // แสดงการแจ้งเตือนเมื่อจองสำเร็จ
        this.closeConfirmationPopup(); // ปิดป๊อปอัพยืนยัน
      },
      (error) => {
        alert('Error booking booth: ' + (error.error?.message || 'An unexpected error occurred.')); // แสดงการแจ้งเตือนเมื่อมีข้อผิดพลาด
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  getLoggedInMember(): void {
    const data = this.authService.getMemberData(); // ดึงข้อมูลสมาชิกโดยตรง
    if (data) {
      this.memberData = data; // เก็บข้อมูลสมาชิกที่ล็อกอินเข้ามา
      this.member_id = this.memberData.member_id; // ดึง member_id จากข้อมูลสมาชิก
      console.log(this.memberData); // ตรวจสอบข้อมูลสมาชิกใน Console
    } else {
      console.error('No member data found');
    }
  }
  
}
