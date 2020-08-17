
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutesModule } from './auth.routes';

import { RequireAuthGuard, RequireUnauthGuard, AdminGuard, EditorGuard, AuthGuard, SuperGuard } from './guards';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    SignInComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutesModule,
    NgxChartsModule,
    NgxPaginationModule,
    FilterPipeModule
  ],
  providers: [
    RequireAuthGuard,
    RequireUnauthGuard,
    AdminGuard,
    EditorGuard,
    AuthGuard,
    SuperGuard
  ]
})
export class AuthModule { }
