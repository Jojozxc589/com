import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent {
  project: any;

  constructor(
    public dialogRef: MatDialogRef<EditProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.project = { ...data.project };
  }

  onNoClick(): void {
    
    this.dialogRef.close(); // ปิดป็อปอัปเมื่อกดปุ่มยกเลิก
  }

  onSaveClick(): void {
    this.dialogRef.close(this.project); // ส่งข้อมูลกลับเมื่อกดปุ่มบันทึก
  }
}
