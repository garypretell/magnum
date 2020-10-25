import { Component, OnDestroy, OnInit} from '@angular/core';
import { isNil, remove, reverse } from 'lodash';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public auth: AuthService
  ) {
    this.translate.setDefaultLang('en');
  }
  ngOnInit(): void {
  }
}

