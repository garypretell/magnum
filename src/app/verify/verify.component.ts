import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  constructor( public router: Router, public auth: AuthService) { }

  ngOnInit(): void {
  }

  goLogin() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

}
