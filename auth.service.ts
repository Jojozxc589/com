import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseApiUrl = 'http://localhost/angular-webpro';
  private loginApiUrl = `${this.baseApiUrl}/login4`;
  private registerApiUrl = `${this.baseApiUrl}/register1`;
  private projectApiUrl = `${this.baseApiUrl}/getProjectDetails2`;
  private boothApiUrl = `${this.baseApiUrl}/getBoothDetails`;
  private deleteboothApiUrl = `${this.baseApiUrl}/deleteBooth21`;

  private projectsSubject = new BehaviorSubject<any[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  
  private currentMemberSubject: BehaviorSubject<any>;
  public currentMember: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentMemberSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentMember')!));
    this.currentMember = this.currentMemberSubject.asObservable();
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An unexpected error occurred.';
    alert(message); // หรือใช้ popup หรือ toast notification
    return throwError(error);
  }

  // ฟังก์ชันสำหรับการเข้าสู่ระบบ
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginApiUrl, { email, password }).pipe(
      tap(data => {
        if (data) {
          localStorage.setItem('currentMember', JSON.stringify(data));
          this.currentMemberSubject.next(data);
        }
      }),
      catchError(error => this.handleError(error))
    );
}
  // ฟังก์ชันสำหรับการลงทะเบียน
  register(prefix: string, firstName: string, lastName: string, phone: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(this.registerApiUrl, { 
      prefix, 
      first_name: firstName, 
      last_name: lastName, 
      phone,
      email, 
      password 
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // ฟังก์ชันเพื่อดึงข้อมูลโปรเจกต์
  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/getProjectDetails2`).pipe(
      tap((projects) => {
        this.projectsSubject.next(projects); // อัปเดตข้อมูลใน BehaviorSubject
      }),
      catchError(error => this.handleError(error))
    );
  }

  // // ฟังก์ชันเพื่อดึงข้อมูลบูธ
  getBooths(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.boothApiUrl}/${projectId}`);
  }
// getBooths(projectId: number): Observable<any> {
//   return this.http.get<any>(`${this.boothApiUrl}/${projectId}`).pipe(
//     tap(data => {
//       console.log('Booth data:', data); // แสดงข้อมูลบูธในคอนโซล
//     }),
//     catchError(error => this.handleError(error))
//   );
// }


  // ฟังก์ชันเพื่อดึงข้อมูลสมาชิกปัจจุบัน
  getMemberData(): any {
    return this.currentMemberSubject.value;
  }

  // ฟังก์ชันสำหรับการออกจากระบบ
  logout(): void {
    localStorage.removeItem('currentMember');
    this.currentMemberSubject.next(null);
  }

  // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
  isLoggedIn(): boolean {
    return !!this.getMemberData();
  }

  // ฟังก์ชันดึงข้อมูลบูธโดยรหัสบูธ
  getBoothDetails(boothCode: string): Observable<any> {
    return this.http.get<any>(`${this.boothApiUrl}/booths/${boothCode}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // ฟังก์ชันสำรองบูธ
  reserveBooth(memberId: number, boothIds: string[]): Observable<any> {
    const body = { member_id: memberId, booth_ids: boothIds };
    return this.http.post<any>(`${this.baseApiUrl}/Booth8`, body);
  }

  // ฟังก์ชันอัปเดตโปรเจกต์
  updateProject(project: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/updateProject17`, project);
  }
  // ฟังก์ชันดึงข้อมูลบูธโดย ID
  getBoothById(boothId: number): Observable<any> {
    return this.http.get<any>(`${this.boothApiUrl}/booths/${boothId}`).pipe(
      catchError(error => this.handleError(error))
    );
  }
// ฟังก์ชันสำหรับการอัปเดตบูธ
updateBooth(boothCode: string, boothName: string, size: string, boothInfo: string, projectId: string): Observable<any> {
  const body = {
    booth_code: boothCode,
    booth_name: boothName,
    size: size,
    booth_info: boothInfo,
    project_id: projectId
  };

  return this.http.post<any>(`${this.baseApiUrl}/updateBooth20`, body, {
    headers: { 'Content-Type': 'application/json' }
  }).pipe(
    catchError(error => this.handleError(error))
  );
}
//เพิ่มโซน
addProject(projectData: any): Observable<any> {
  return this.http.post<any>(`${this.baseApiUrl}/addProject16`, projectData).pipe(
    tap(() => {
      this.getProjects().subscribe(); // โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
    }),
    catchError(error => this.handleError(error))
  );
}

//เพิ่มบูธ
addBooth(boothData: any): Observable<any> {
  console.log('Adding booth with data:', boothData); // เพิ่ม log
  return this.http.post<any>(`${this.baseApiUrl}/addBooth19`, boothData).pipe(
    catchError(error => this.handleError(error))
  );
}
//ลบโซน
deleteProject(projectId: number): Observable<any> {
  return this.http.delete<any>(`http://localhost/angular-webpro/deleteProject18/${projectId}`);
}
////ลบบูธ
deleteBooth(boothName: string): Observable<any> {
  return this.http.post(`${this.baseApiUrl}/deleteBooth21`, { booth_name: boothName }, {
    headers: { 'Content-Type': 'application/json' }
  });
}
////รายการจอง
showBookings(email: string): Observable<any> {
  const body = { email }; // สร้าง body สำหรับ POST

  return this.http.post<any>(`${this.baseApiUrl}/showBookings13`, body).pipe(
    catchError(error => {
      return throwError(error);
    })
  );
}
cancelBooking(bookingId: number): Observable<any> {
  return this.http.post(`${this.baseApiUrl}/cancelBooking11`, { booking_id: bookingId });
}

  // ฟังก์ชันสำหรับยืนยันการชำระเงิน
  confirmPayment(bookingId: number, paymentProofUrl: string): Observable<any> {
    const payload = {
      booking_id: bookingId,
      payment_proof_url: paymentProofUrl // ใช้ชื่อไฟล์แทน URL ของสลิป
    };
    return this.http.post(`${this.baseApiUrl}/updateBookingStatus10`, payload);
  }

  // ฟังก์ชันสำหรับอัปเดตข้อมูลสลิปการชำระเงิน (ถ้าจำเป็น)
  updatePaymentProof(paymentData: { paymentProofUrl: string }): Observable<any> {
    return this.http.post(`${this.baseApiUrl}/updatePaymentProof`, paymentData);
  }
  ///เพิ่ม
  cancelBookings(bookingId: number) {
    return this.http.post<any>(`http://localhost/angular-webpro/updateBookingDate`, { booking_id: bookingId });
  }
  updateBookingDate(bookingId: number) {
    return this.http.post<any>(`http://localhost/angular-webpro/updateBookingDate`, { booking_id: bookingId });
  ///แก้ชื่อ
  }
  updateMemberData(memberData: any): Observable<any> {
    return this.http.post(`${this.baseApiUrl}/updateMember12`, memberData); // ส่งข้อมูลไปยัง API
  }
  getMembers(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/members23`).pipe(
      catchError(error => this.handleError(error))
    );
  }
  getUnpaidBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/unpaidBookings24`).pipe(
      catchError(error => this.handleError(error))
    );
  }
  
  getPaidBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/paidBookings25`).pipe(
      catchError(error => this.handleError(error))
    );
  }
  getPendingReviews(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/pendingReviews26`).pipe(
      catchError(error => this.handleError(error))
    );
  }
  getBookedBooths(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/pendingReviews27`).pipe(
      catchError(error => this.handleError(error))
    );
  }
  // ฟังก์ชันสำหรับการอัปเดตข้อมูลสมาชิก
updateMember(memberId: number, updatedData: any): Observable<any> {
  return this.http.put<any>(`${this.baseApiUrl}/updateMember/${memberId}`, updatedData).pipe(
    tap(data => {
      // อัปเดตข้อมูลใน localStorage หากจำเป็น
      const currentMember = this.getMemberData();
      if (currentMember && currentMember.id === memberId) {
        const updatedMember = { ...currentMember, ...data };
        localStorage.setItem('currentMember', JSON.stringify(updatedMember));
        this.currentMemberSubject.next(updatedMember);
      }
    }),
    catchError(error => this.handleError(error))
  );
}
getBookingsWithNullEvent(): Observable<any> {
  return this.http.get<any>(`${this.baseApiUrl}/getBookingsWithNullEvent`);
}

// ฟังก์ชันเพื่ออัปเดต event_code
updateEventCode(bookingId: number, eventCode: string): Observable<any> {
  const body = { booking_id: bookingId, event_code: eventCode };
  return this.http.post(`${this.baseApiUrl}/updateEventCode`, body);
}

}