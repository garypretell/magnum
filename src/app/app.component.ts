import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public auth: AuthService
  ) {
    this.translate.setDefaultLang('en');
  }
}
