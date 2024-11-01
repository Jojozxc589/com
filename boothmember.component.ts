import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-boothmember',
  templateUrl: './boothmember.component.html',
  styleUrls: ['./boothmember.component.scss']
})
export class BoothmemberComponent implements OnInit {
  booths: any[] = [];
  projectId!: number;
  memberData: any = {}; // ตัวแปรสำหรับเก็บข้อมูลสมาชิกที่ล็อกอิน

  constructor(private router: ActivatedRoute, private authService: AuthService, private route: Router,private location: Location) {}

  ngOnInit(): void {
    this.projectId = +this.router.snapshot.paramMap.get('projectId')!;
    this.getLoggedInMember(); // เรียกข้อมูลสมาชิกที่ล็อกอิน
    this.authService.getBooths(this.projectId).subscribe(
      (data) => {
        this.booths = data;
      },
      (error) => {
        console.error('Error fetching booths:', error);
      }
    );
  }
  

  // ฟังก์ชันเพื่อไปยังหน้า reserve พร้อมส่งข้อมูลบูธ
  goToReserve(booth: any): void {
    this.route.navigate(['/main/reserve', { 
      boothCode: booth.booth_code, 
      boothName: booth.booth_name, 
      size: booth.size, 
      status: booth.status, 
      price: booth.price,
      info : booth.booth_info,
      projectId : booth.project_id,
      boothIds: JSON.stringify([booth.booth_id]) // ส่ง booth_id ที่เลือกไปด้วย
    }]);
  }
  getLoggedInMember(): void {
    const data = this.authService.getMemberData(); // ดึงข้อมูลสมาชิกโดยตรง
    if (data) {
      this.memberData = data; // เก็บข้อมูลสมาชิกที่ล็อกอินเข้ามา
      console.log(this.memberData); // ตรวจสอบข้อมูลสมาชิกใน Console
    } else {
      console.error('No member data found');
    }
  }
  goBack(): void {
    this.location.back();
  }
}
