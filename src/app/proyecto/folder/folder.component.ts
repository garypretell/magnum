import { Component, OnInit, HostListener, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { map, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ElectronService } from 'app/core/services';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  showCropper = false;
  image: any;
  cropper: any = {};
  microp;
  mifolder;
  cropList$: Observable<any>;
  miCrop$: Observable<any>;
  base64Image;
  dataUrl;

  folderPath;
  document;
  name;
  constructor(
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public auth: AuthService,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private _location: Location,
    private electronService: ElectronService
  ) { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F12') {
      if (this.microp) {
        this.takePhoto();
      } else {
        alert('seleccione crop');
      }
    }
  }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.pipe(switchMap(params => {
      this.mifolder = params.get('f');
      return this.afs.doc(`Folder/${this.mifolder}`).valueChanges().pipe(map((data: any) => {
        this.folderPath = data.pathname;
        this.document = data.document;
        this.name = data.name;
      }));
    })).subscribe();
    this.cropList$ = this.afs.collection('Crops').valueChanges({ idField: 'id' });
  }

  selectCrop() {
  }

  async cropImage(path) {
    const { waitFile } = require('wait-file');
    var Clipper = require('image-clipper');
    const x = this.microp.x11;
    const y = this.microp.y11;
    const w = this.microp.x22 - this.microp.x11;
    const h = this.microp.y22 - this.microp.y11;
    const filePath = `M:/Imagenes/${this.mifolder}/${this.name}/${Date.now()}.jpg`
    Clipper(path, function () {
      this.crop(x, y, w, h)
        .quality(100)
        .toFile(filePath, function () {
          console.log('saved!');
        });
    });
    const opts = {
      resources: [filePath],
      delay: 0, // initial delay in ms, default 0ms
      interval: 100, // poll interval in ms, default 250ms
      log: false, // outputs to stdout, remaining resources waited on and when complete or errored, default false
      reverse: false, // resources being NOT available, default false
      timeout: 30000, // timeout in ms, default Infinity
      verbose: false, // optional flag which outputs debug output, default false
      window: 1000, // stabilization time in ms, default 750ms
    };
    try {
      var fs = require('fs');
      await waitFile(opts);
      var bitmap = fs.readFileSync(filePath);
      this.dataUrl = Buffer.from(bitmap).toString('base64');
      this.deleteFile(path);
    } catch (err) {
      console.error(err);
    }
  }

  async takePhoto() {
    this.dataUrl = null;
    const { waitFile } = require('wait-file');
    var dir = `${this.mifolder}/${this.name}/${Date.now()}.jpg`;
    var child = require('child_process').exec;
    var executablePath = `M:/camera.bat ${dir}`;
    child(executablePath, (err, data) => {
    })
    const opts = {
      resources: [`D:/Magnum-Camera/Photos/${dir}`],
      delay: 0, // initial delay in ms, default 0ms
      interval: 100, // poll interval in ms, default 250ms
      log: false, // outputs to stdout, remaining resources waited on and when complete or errored, default false
      reverse: false, // resources being NOT available, default false
      timeout: 30000, // timeout in ms, default Infinity
      verbose: false, // optional flag which outputs debug output, default false
      window: 1000, // stabilization time in ms, default 750ms
    };
    try {
      await waitFile(opts);
      this.cropImage(`D:/Magnum-Camera/Photos/${dir}`);
    } catch (err) {
      console.error(err);
    }
  }

  deleteFile(filePath) {
    var fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log('does not')
    }
  }

  base64_encode(file) {
    var fs = require('fs');
    var bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString('base64');
  }

  loadImage(path) {
    console.log(path);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  backClicked() {
    this._location.back();
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  goCrop() {
    this.router.navigate(['/proyecto', this.mifolder, 'crop']);
  }

}
