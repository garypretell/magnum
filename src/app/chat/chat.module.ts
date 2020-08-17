import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat.component';
import { ChatRoutingModule } from './chat.route';
import { FilterPipeModule } from 'ngx-filter-pipe';

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    FilterPipeModule
  ]
})
export class ChatModule { }
