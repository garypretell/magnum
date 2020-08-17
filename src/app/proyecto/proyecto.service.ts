import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  proyectosCollection: AngularFirestoreCollection<any>;
  proyectos$: Observable<any[]>;
  proyectoDoc: AngularFirestoreDocument<any>;
  constructor(public afs: AngularFirestore,  private http: HttpClient) {
    this.proyectosCollection = afs.collection<any>('Proyecto', ref => ref.orderBy('createdAt', 'desc'));
    this.proyectos$ = this.proyectosCollection.valueChanges({idField: 'id'});
   }

   getAll() {
    return this.proyectos$;
  }

  createProyectos(proyecto: any) {
    return  this.proyectosCollection.add(proyecto);
  }

  removeProyectos(proyecto: any) {
    this.proyectoDoc = this.afs.doc(`Proyecto/${proyecto.id}`);
    proyecto.estado = false;
    return this.proyectoDoc.update(proyecto);
  }

  updateProyectos(proyecto: any) {
    this.proyectoDoc = this.afs.doc(`Proyecto/${proyecto.id}`);
    return  this.proyectoDoc.update(proyecto);
  }
}
