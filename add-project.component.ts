import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent {
  project_id!: string;
  project_name!: string;
  project_info!: string;
  total_booths!: number;
  project_code!: string;

  constructor(
    public dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {}

  // ปิด dialog
  onCancel(): void {
    this.dialogRef.close();
  }

  // ส่งข้อมูล project ไปยัง service เพื่อเพิ่มข้อมูล
  onSubmit(): void {
    const projectData = {
      project_id: this.project_id,
      project_name: this.project_name,
      total_booths: this.total_booths,
      project_code: this.project_code,
      project_info: this.project_info
    };

    // ใช้ authService เพื่อเพิ่มโปรเจกต์ใหม่
    this.authService.addProject(projectData).subscribe(
      response => {
        alert('เพิ่มโซนเรียบร้อยแล้ว');
        this.dialogRef.close(projectData); // ปิด dialog พร้อมส่งข้อมูล project ที่เพิ่งเพิ่มเสร็จกลับไป

      },
      error => {
        alert('เกิดข้อผิดพลาดในการเพิ่มโซน');
        console.error('Error adding project:', error);
      }
    );
  }
}
