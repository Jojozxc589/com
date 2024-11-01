import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditBoothComponent } from 'src/app/dialog/edit-booth/edit-booth.component';
import { AddProjectComponent } from 'src/app/dialog/add-project/add-project.component';
import { AddBoothComponent } from 'src/app/dialog/add-booth/add-booth.component';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-boothadmin',
  templateUrl: './boothadmin.component.html',
  styleUrls: ['./boothadmin.component.scss']
})
export class BoothadminComponent implements OnInit {
  booths: any[] = [];
  projectId!: number;
  memberData: any = {}; // ตัวแปรสำหรับเก็บข้อมูลสมาชิกที่ล็อกอิน

  constructor(private dialog: MatDialog, private router: ActivatedRoute, private authService: AuthService, private route: Router, private location: Location) {}

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

  // ฟังก์ชันเพื่อไปยังหน้าเพิ่มบูธ
  goToAddBooth(): void {
    this.route.navigate(['/main/add-booth']);
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

  // ฟังก์ชันสำหรับลบบูธ
  // ฟังก์ชันสำหรับแสดง dialog ยืนยันการลบ
  confirmDeleteBooth(boothId: number, boothName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: `คุณต้องการลบบูธ ${boothName} ใช่หรือไม่?` } // ข้อความยืนยัน
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // หากยืนยันให้เรียกฟังก์ชันลบ
        this.deleteBooth(boothId, boothName);
      }
    });
  }

  deleteBooth(boothId: number, boothName: string): void {
    this.authService.deleteBooth(boothName).subscribe(
      () => {
        this.booths = this.booths.filter(b => b.booth_id !== boothId); // อัปเดตข้อมูลบูธ
        console.log('Booth deleted successfully');
      },
      (error) => {
        console.error('Error deleting booth:', error);
      }
    );
  }

  
  // boothadmin.component.ts
goToEditBooth(boothId: number): void {
  const boothToEdit = this.booths.find(booth => booth.booth_id === boothId); // หาบูธที่ต้องการแก้ไข

  const dialogRef = this.dialog.open(EditBoothComponent, {
    width: '400px', // กำหนดขนาดของ dialog
    data: {
      booth_name: boothToEdit.booth_name, // ส่งชื่อบูธ
      size: boothToEdit.size,             // ส่งขนาดบูธ
      booth_info: boothToEdit.booth_info, // ส่งข้อมูลบูธ
      project_id: this.projectId,         // ส่งรหัสโปรเจค
      booth_code: boothToEdit.booth_code   // ส่งรหัสบูธ
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Dialog result:', result);
      // อัปเดตข้อมูลบูธในตารางถ้าจำเป็น
      this.getBooths(); // เรียกฟังก์ชันเพื่อดึงข้อมูลบูธใหม่
    }
  });
}

getBooths(): void {
  this.authService.getBooths(this.projectId).subscribe(
    (data) => {
      this.booths = data;
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
      this.getBooths(); // เรียกฟังก์ชันเพื่อดึงข้อมูลบูธใหม่ถ้ามีการเพิ่มโซน
    }
  });
}
// ภายในคลาส BoothadminComponent
openAddBoothDialog(): void {
  const dialogRef = this.dialog.open(AddBoothComponent, {
    width: '500px',
    data: { project_id: this.projectId } // ส่ง project_id ให้กับ dialog
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.success) {
      this.getBooths(); // เรียกฟังก์ชันเพื่อดึงข้อมูลบูธใหม่ถ้ามีการเพิ่มบูธ
    }
  });
}
}
