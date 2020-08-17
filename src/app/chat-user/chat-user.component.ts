import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ChatService } from '../chat/chat.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat-user',
  templateUrl: './chat-user.component.html',
  styleUrls: ['./chat-user.component.scss']
})
export class ChatUserComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribe$ = new Subject();
  @ViewChild('inputEl') inputEl: ElementRef;

  chatId: any;
  chat$: Observable<any>;
  newMsg: string;
  constructor(public chatService: ChatService,
              // private afAuth: AngularFireAuth,
              public route: ActivatedRoute,
              private afs: AngularFirestore,
              public auth: AuthService,
              private router: Router ) { }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    const source = this.chatService.get(this.chatId);
    this.chat$ = this.chatService.joinUsers(source); // .pipe(tap(v => this.scrollBottom(v)));
    this.scrollBottom();
  }

  async ngOnDestroy() {
    const { uid } = await this.auth.getUser();
    const recibe = 'recibe_' + uid;
    await this.afs.collection(`mensajes`, ref => ref.where('chatId', '==', this.chatId)
    .where('recibe', '==', uid).where('estado', '==', recibe)).valueChanges({idField: 'id' }).pipe(map(m => {
      m.map((data: any) => {
      this.afs.doc(`mensajes/${data.id}`).update({estado: 'leido'});
      });
    })).take(1).subscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 1000);
  }

  private scrollBottom() {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1000);
  }

  submit(chatId) {
    if (!this.newMsg) {
      return alert('you need to enter something');
    }
    this.chatService.sendMessage(this.chatId, this.newMsg);
    this.newMsg = '';
    this.scrollBottom();
  }

  trackByCreated(i, msg) {
    return msg.createdAt;
  }

  async actualizaSalida() {
    const { uid } = await this.auth.getUser();
    const recibe = 'recibe_' + uid;
    this.afs.collection(`mensajes`, ref => ref.where('chatId', '==', this.chatId)
    .where('recibe', '==', uid).where('estado', '==', recibe)).valueChanges({idField: 'id' }).pipe(map(m => {
      if (m) {
        m.map((data: any) => {
          this.afs.doc(`mensajes/${data.id}`).update({estado: 'leido'});
          });
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    return this.router.navigate(['Chat']);
  }

}
