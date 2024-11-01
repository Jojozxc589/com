import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-editmember',
  templateUrl: './editmember.component.html',
  styleUrls: ['./editmember.component.scss']
})
export class EditMemberComponent implements OnInit {
  memberData: any = {}; // ตัวแปรสำหรับเก็บข้อมูลสมาชิกที่ล็อกอิน
  successMessage: string = ''; // ตัวแปรสำหรับเก็บข้อความอัปเดตสำเร็จ

  constructor(private authService: AuthService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.getLoggedInMember(); // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลสมาชิกที่ล็อกอิน
  }

  getLoggedInMember(): void {
    const data = this.authService.getMemberData(); // ดึงข้อมูลสมาชิกที่ล็อกอิน
    if (data) {
      this.memberData = data; // เก็บข้อมูลสมาชิกที่ล็อกอินเข้ามา
      console.log(this.memberData); // ตรวจสอบข้อมูลสมาชิกใน Console
    } else {
      console.error('No member data found');
    }
  }

  goBack(): void {
    this.location.back(); // กลับไปยังหน้าก่อนหน้า
  }

  updateMember(): void {
    // ตรวจสอบว่ามี member_id ใน memberData หรือไม่
    if (!this.memberData.member_id) {
      console.error('Member ID is missing');
      return;
    }

    // ส่งข้อมูลที่ต้องการอัปเดตไปยังแบ็กเอนด์
    this.authService.updateMemberData(this.memberData).subscribe(
      (response) => {
        console.log('Member data updated successfully:', response);
        this.successMessage = 'อัปเดตสำเร็จ'; // แสดงข้อความอัปเดตสำเร็จ
        setTimeout(() => {
          this.goBack(); // กลับไปยังหน้าก่อนหลังจาก 2 วินาที
        }, 2000);
      },
      (error) => {
        console.error('Error updating member data:', error);
      }
    );
  }
}
