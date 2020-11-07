import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { Location } from '@angular/common';
import { ImageTransform, ImageCroppedEvent, base64ToFile, Dimensions } from 'ngx-image-cropper';
import { of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ElectronService } from 'app/core/services';

@Component({
  selector: 'app-crop',
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.scss']
})
export class CropComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  image;
  imageBase64String;
  cropper: any = {};
  originalImage;
  public addCropForm: FormGroup;
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
      this.takePhoto();
    }
  }

  ngOnInit() {
    this.takePhoto();
    this.addCropForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      estado: [''],
      usuarioid: [''],
      x1:[''],
      y1:[''],
      x2:[''],
      y2:[''],
      x11:[''],
      y11:[''],
      x22:[''],
      y22:[''],
    });

  }

  async saveCrop() {
    const { uid } = await this.auth.getUser();
    this.addCropForm.value.x1 = this.cropper.x1;
    this.addCropForm.value.y1 = this.cropper.y1;
    this.addCropForm.value.x2 = this.cropper.x2;
    this.addCropForm.value.y2 = this.cropper.y2;
    this.addCropForm.value.x11 = this.originalImage.x1;
    this.addCropForm.value.y11 = this.originalImage.y1;
    this.addCropForm.value.x22 = this.originalImage.x2;
    this.addCropForm.value.y22 = this.originalImage.y2;
    this.addCropForm.value.estado = true;
    this.addCropForm.value.usuarioid = uid;
    this.afs.collection(`Crops`).add(this.addCropForm.value);
    this.addCropForm.reset();
    this.backClicked();

  }

  takePhoto() {
    this.deleteFile();
    var child = require('child_process').exec;
    var executablePath = `M:/crop.bat`;
    var dir = 'D:/Magnum-Camera/Crop/crop.jpg';
    child(executablePath, (err, data) => {
      // if (err) {
      //   console.error(err);
      //   return;
      // }
      // console.log(data);
    })
    this.getFile(dir, 500);
  }

  getFile(path, timeout) {
    var fs = require('fs');
    const tiempo = setInterval(() => {
      const file = path;
      const fileExists = fs.existsSync(file);
      if (fileExists) {
        clearInterval(tiempo);
        this.loadImage();
        return;
      }
    }, timeout);
  };

  deleteFile() {
    var fs = require('fs');
    var filePath = 'D:/Magnum-Camera/Crop/crop.jpg';
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log('does not')
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.deleteFile();
  }

  loadImage() {
    this.image = this.electronService.fs.readFileSync('D:/Magnum-Camera/Crop/crop.jpg').toString('base64');
    this.imageBase64String = 'data:image/jpg;base64,' + this.image;
  }
  reloadImage() {
    this.loadImage();
  }

  backClicked() {
    this._location.back();
  }

  async goFolder() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', proyecto.id, 'camera']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  imageCropped(event: ImageCroppedEvent) {
    // this.cropper = event.imagePosition;
    console.log(event.imagePosition);
    this.originalImage = event.imagePosition;
    this.croppedImage = event.base64;
    // console.log(this.croppedImage);

  }

  imageLoaded() {
    this.showCropper = true;
    // console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }
}
