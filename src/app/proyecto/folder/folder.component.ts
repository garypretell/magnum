import { Component, OnInit, HostListener } from '@angular/core';
import {Location} from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  
  constructor(
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public auth: AuthService,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private _location: Location
  ) { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key === 'F12'){
      alert('Key was pressed');
    }
    
  }
  ngOnInit(): void {
  }

  backClicked() {
    this._location.back();
  }

  goHome() {
    this.router.navigate(['/Home']);
  }
}
