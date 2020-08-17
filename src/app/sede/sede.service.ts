import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { firestore } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  sedesCollection: AngularFirestoreCollection<any>;
  sedes$: Observable<any[]>;
  sedeDoc: AngularFirestoreDocument<any>;
  constructor(public afs: AngularFirestore,  private http: HttpClient) {
    this.sedesCollection = afs.collection<any>('Sede');
    this.sedes$ = this.sedesCollection.valueChanges({idField: 'id'});
   }


   getList() { return this.sedes$; }

   getSede(id) {
     return  this.afs.collection(`Sede`, ref => ref.where('proyecto', '==', id)).valueChanges({idField: 'id'});
   }

   async createSede(sede) {
    this.afs.doc(`Sede/${(sede.sede)}`).set(sede, { merge: true });
    const proyecto: any = {
      id: sede.sede,
      nombre: sede.nombre
    };
    await this.afs.doc(`Proyecto/${sede.proyecto}`).update({
      sedes: firestore.FieldValue.arrayUnion(proyecto)
    });
  }

  async removeSede(sede: any) {
    const proyecto: any = {
      id: sede.sede,
      nombre: sede.nombre
    };
    await this.afs.doc(`Proyecto/${sede.proyecto}`).update({
      sedes: firestore.FieldValue.arrayRemove(proyecto)
    });
    this.sedeDoc = this.afs.doc(`Sede/${sede.id}`);
    sede.estado = false;
    return this.sedeDoc.update(sede);

  }

  async updateSede(sede: any) {
    if (sede.estado === true) {
      const proyecto: any = {
        id: sede.sede,
        nombre: sede.nombre
      };
      await this.afs.doc(`Proyecto/${sede.proyecto}`).update({
        sedes: firestore.FieldValue.arrayUnion(proyecto)
      });
    }
    this.sedeDoc = this.afs.doc(`Sede/${sede.id}`);
    return this.sedeDoc.update(sede);
  }

}
