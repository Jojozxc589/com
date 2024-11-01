import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  projects: any[] = []; // ตัวแปรสำหรับเก็บข้อมูลโครงการ

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchProjects(); // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อคอมโพเนนต์ถูกสร้างขึ้น
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

  // ฟังก์ชันสำหรับเรียกดูรายละเอียดบูธ
viewBooths(projectId: number): void {
  // ใช้ Angular Router ในการเปลี่ยนเส้นทางไปยังหน้าบูธ พร้อมกับ projectId ที่เลือก
  this.router.navigate([`/main/booth/${projectId}`]); // เปลี่ยน URL ให้เป็นแบบนี้
}
login(): void {
  this.router.navigate(['/login']); // เปลี่ยนเส้นทางไปยังหน้า Login
}

// ฟังก์ชันสำหรับการสมัครสมาชิก
register(): void {
  this.router.navigate(['/page/register']); // เปลี่ยนเส้นทางไปยังหน้าสมัครสมาชิก
}

}
