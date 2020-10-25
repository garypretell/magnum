import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { RequireUnauthGuard, EditorGuard } from './auth/guards';
import { SedeResolverGuard } from './sede/sede-resolver.guard';
const routes: Routes = [
  {
    path: '',
    loadChildren:  './auth/auth.module#AuthModule',
    canActivate: [RequireUnauthGuard]
  },
  {
    path: 'Home',
    loadChildren:  './inicio/inicio.module#InicioModule',
  },
  {
    path: 'registrar',
    loadChildren: './account/account.module#AccountModule'
  },
  {
    path: 'verify-email',
    loadChildren: './verify/verify.module#VerifyModule'
  },
  {
    path: 'proyecto',
    loadChildren: './proyecto/proyecto.module#ProyectoModule'
  },
  {
    path: 'familysearch',
    loadChildren: './familysearch/familysearch.module#FamilySearchModule'
  },
  {
    path: 'proyecto/:p/sede',
    loadChildren: './sede/sede.module#SedeModule',
    canActivate: [EditorGuard],
    resolve: { sede: SedeResolverGuard}
  },
  {
    path: 'Chat',
    loadChildren: './chat/chat.module#ChatModule'
  },
  {
    path: 'chats/:id',
    loadChildren:'./chat-user/chat-user.module#ChatUserModule'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
