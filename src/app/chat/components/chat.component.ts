import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable, combineLatest, of } from 'rxjs';
import { map, flatMap, takeUntil, switchMap, mergeMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../../auth/auth.service';
import { ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  roomChats$: Observable<any>;

  constructor(public auth: AuthService,
              public chatService: ChatService,
              public afs: AngularFirestore,
              private activatedroute: ActivatedRoute,
              ) { }

  async ngOnInit() {
   await this.collection();
    // this.sub = this.activatedroute.data.pipe(map((data: { chats: Observable<any[]> }) => {
    //   console.log(data.chats);
    //   this.roomChats$ = data.chats;
    // })).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async collection() {
    this.auth.user$.pipe(switchMap((da: any) => {
      if (da) {
        this.roomChats$ = this.afs.doc(`Proyecto/${da.proyecto.id}`).valueChanges().pipe(map((datos: any) => {
            const misusuarios = datos.usuarios.filter(f => f.admin === true);
            return misusuarios.map((change: any) => {
              const data = change;
              const user = data.uid;
              const roomname = (da.uid < user ? da.uid + user : user + da.uid);
              const recibe = 'recibe_' + da.uid;
              const col = this.afs.collection(
                `mensajes`,
                ref => ref.where('chatId', '==', roomname).where('recibe', '==', da.uid).where('estado', '==', recibe).
                  orderBy('fecha', 'asc')
              );
              return col.valueChanges().pipe(
                map(ratings => Object.assign(data, { ratings }))
              );
            });
          }),
            mergeMap(feeds => combineLatest(feeds))
          );
        return this.roomChats$;
      } else {
        return of(null);
      }

    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  conectar(item) {
    this.chatService.conectar(item.uid);
  }

  trackByFn(index, item) {
    return item.id;
  }

}
