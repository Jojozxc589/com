import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-booth',
  templateUrl: './edit-booth.component.html',
  styleUrls: ['./edit-booth.component.scss']
})
export class EditBoothComponent {
  boothName: string;
  size: string;
  boothInfo: string;
  projectId: string;

  constructor(
    public dialogRef: MatDialogRef<EditBoothComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {
    this.boothName = data.booth_name;
    this.size = data.size;
    this.boothInfo = data.booth_info;
    this.projectId = data.project_id;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // ใช้ตัวแปรที่กำหนดไว้ใน class
    this.authService.updateBooth(
      this.data.booth_code,    // รหัสบูธ
      this.boothName,          // ชื่อบูธ
      this.size,               // ขนาด
      this.boothInfo,          // ข้อมูลบูธ
      this.projectId           // รหัสโปรเจกต์
    ).subscribe(
      response => {
        // แสดงข้อความยืนยันใน dialog
        this.dialogRef.close(response); // ปิด dialog และส่งข้อมูลกลับ
        alert('บันทึกข้อมูลบูธเรียบร้อยแล้ว'); // แสดงข้อความยืนยัน
      },
      error => {
        // แสดงข้อความผิดพลาดใน dialog
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล'); // แสดงข้อความข้อผิดพลาด
      }
    );
  }
}
