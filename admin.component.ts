import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditProjectComponent } from 'src/app/dialog/edit-project/edit-project.component';
import { AddProjectComponent } from 'src/app/dialog/add-project/add-project.component';
import { AddBoothComponent } from 'src/app/dialog/add-booth/add-booth.component'; 

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  projects: any[] = [];
  selectedProject: any = {};
  isModalOpen: boolean = false;
  memberData: any;
  booths: any[] = []; // เพิ่มตัวแปรเพื่อเก็บข้อมูลบูธ

  constructor(private projectService: AuthService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadProjects();
    this.checkLoginStatus();
    this.getBooths(this.selectedProject.id); // เรียกใช้งาน getBooths พร้อม projectId
    
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
    });
  }

  checkLoginStatus(): void {
    this.memberData = true; // เปลี่ยนเป็นการตรวจสอบจริง
  }

  openEditModal(project: any): void {
    this.selectedProject = { ...project }; // ทำสำเนาโปรเจกต์ที่เลือก
    this.isModalOpen = true;

    const dialogRef = this.dialog.open(EditProjectComponent, {
      width: '400px',
      data: { project: this.selectedProject }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProject(result);
      }
    });
  }

  updateProject(projectData: any): void {
    this.projectService.updateProject(projectData).subscribe(() => {
      alert('Project updated successfully');
      this.loadProjects();
    }, error => {
      alert('Failed to update project');
      this.loadProjects();
    });
  }

  viewBooths(projectId: number): void {
    this.router.navigate(['/main/boothadmin', projectId]);
  }

  getBooths(projectId: number): void { // เพิ่มฟังก์ชันเพื่อดึงข้อมูลบูธ
    this.projectService.getBooths(projectId).subscribe(
      (data) => {
        this.booths = data; // บันทึกข้อมูลบูธลงในตัวแปร booths
      },
      (error) => {
        console.error('Error fetching booths:', error);
      }
    );
  }

  openAddProjectDialog(): void {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBooths(this.selectedProject.id); // เรียกใช้งาน getBooths พร้อม projectId
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects(); // โหลดข้อมูลโปรเจกต์ใหม่
      }
    });
  }

  deleteProject(projectId: number): void {
    const projectName = this.projects.find(project => project.project_id === projectId)?.project_name;

    if (confirm(`คุณต้องการลบโซน ${projectName} ใช่หรือไม่?`)) {
        this.projectService.deleteProject(projectId).subscribe(() => {
            this.loadProjects(); // โหลดรายการโครงการใหม่หลังจากลบสำเร็จ
        }, error => {
            this.loadProjects();
        });
    }
}
}
