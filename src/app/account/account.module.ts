import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './components/account.component';
import { AccountRoutingModule } from './account.route';
import { FilterPipeModule } from 'ngx-filter-pipe';

@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountRoutingModule,
    FilterPipeModule
  ]
})
export class AccountModule { }
