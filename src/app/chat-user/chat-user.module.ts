import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatUserComponent } from './chat-user.component';
import { ChatUserRoutingModule } from './chat-user.route';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [ChatUserComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChatUserRoutingModule,
    NgxPaginationModule,
  ]
})
export class ChatUserModule { }
