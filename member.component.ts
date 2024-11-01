import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  projects: any[] = []; // ตัวแปรสำหรับเก็บข้อมูลโครงการ
  memberData: any = {}; // ตัวแปรสำหรับเก็บข้อมูลสมาชิกที่ล็อกอิน

  constructor(private authService: AuthService, private router: Router,private location: Location) {}

  ngOnInit(): void {
    this.fetchProjects(); // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อคอมโพเนนต์ถูกสร้างขึ้น
    this.getLoggedInMember(); // เรียกข้อมูลสมาชิกที่ล็อกอิน
  }

  fetchProjects(): void {
    this.authService.getProjects().subscribe(
      (data) => {
        this.projects = data; // เก็บข้อมูลที่ดึงมาในตัวแปร projects
        console.log(this.projects); // ตรวจสอบข้อมูลที่ได้
      },
      (error) => {
        console.error('Error fetching projects:', error); // แสดงข้อผิดพลาดใน Console
      }
    );
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
  

  viewBooths(projectId: number): void {
    // ใช้ Angular Router ในการเปลี่ยนเส้นทางไปยังหน้าบูธ พร้อมกับ projectId ที่เลือก
    this.router.navigate([`/main/boothmember/${projectId}`]); // เปลี่ยน URL ให้เป็นแบบนี้
  }
  goBack(): void {
    this.location.back();
  }
}
