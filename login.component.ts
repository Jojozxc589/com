import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;
  showPopup: boolean = false;
  memberId: number | null = null; // เพิ่มตัวแปรสำหรับเก็บ member_id

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        this.memberId = response.member_id; // เก็บ member_id
        this.redirectUser(response.member_status);
      },
      error => {
        this.displayError('Invalid email or password');
      }
    );
  }

  redirectUser(status: string) {
    if (status === 'user') {
      this.router.navigate(['/main/user', { memberId: this.memberId }]); 
    } else if (status === 'moderator') {
      this.router.navigate(['/main/member', { memberId: this.memberId }]); 
    } else if (status === 'admin') {
      this.router.navigate(['/main/admin', { memberId: this.memberId }]); 
    }
  }

  private displayError(message: string) {
    this.errorMessage = message;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  goToRegister() {
    this.router.navigate(['/page/register']);
  }
}
