import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  template: `<section class="page"><div class="card empty">جاري تسجيل الخروج...</div></section>`
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.logout();
  }
}
