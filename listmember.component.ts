import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-listmember',
  templateUrl: './listmember.component.html',
  styleUrls: ['./listmember.component.scss']
})
export class ListmemberComponent implements OnInit {
  members: any[] = [];

  constructor(private authService: AuthService, private location: Location) {}

  ngOnInit(): void {
    this.fetchMembers();
  }

  fetchMembers(): void {
    this.authService.getMembers().subscribe(
      (data) => {
        this.members = data;
      },
      (error) => {
        console.error('Error fetching members:', error);
      }
    );
  }
  goBack(): void {
    this.location.back();
  }
}
