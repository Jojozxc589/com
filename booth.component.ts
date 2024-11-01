import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // เพิ่ม Router
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booth',
  templateUrl: './booth.component.html',
  styleUrls: ['./booth.component.scss']
})
export class BoothComponent implements OnInit {
  projects: any[] = []; // ตัวแปรสำหรับเก็บข้อมูลโครงการ
  booths: any[] = [];
  projectId!: number;

  constructor(private router: ActivatedRoute, private authService: AuthService, private route: Router) {} // เพิ่ม Router

  ngOnInit(): void {
    this.projectId = +this.router.snapshot.paramMap.get('projectId')!;
    this.authService.getBooths(this.projectId).subscribe(
      (data) => {
        this.booths = data;
        
        
      },
      (error) => {
        console.error('Error fetching booths:', error);
      }
      
    );
    
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

  
}
