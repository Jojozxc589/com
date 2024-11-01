import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-booth',
  templateUrl: './add-booth.component.html',
  styleUrls: ['./add-booth.component.scss']
})
export class AddBoothComponent {
  booth_code: string = '';
  booth_name: string = '';
  size: string = '';
  booth_info: string = '';
  project_id: number;
  price: number = 0;

  constructor(
    public dialogRef: MatDialogRef<AddBoothComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {
    this.project_id = data.project_id; // รับ project_id จากข้อมูล dialog
  }

  addBooth(): void {
    const newBooth = {
      booth_code: this.booth_code,
      booth_name: this.booth_name,
      size: this.size,
      booth_info: this.booth_info,
      project_id: this.project_id,
      price: this.price
    };
  
    console.log('New Booth Data:', newBooth); // เพิ่ม log เพื่อตรวจสอบข้อมูล
  
    this.authService.addBooth(newBooth).subscribe(
      response => {
        console.log(response);
        this.dialogRef.close(response); // ปิด dialog และส่งผลลัพธ์
      },
      error => {
        console.error('Error adding booth:', error);
      }
    );
  }
  cancel(): void {
    this.dialogRef.close(); // ปิด dialog โดยไม่ทำอะไร
  }
}
