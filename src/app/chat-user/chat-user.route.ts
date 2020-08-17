import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatUserComponent } from './chat-user.component';

const routes: Routes = [
  {
    path: '',
    component: ChatUserComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatUserRoutingModule { }
