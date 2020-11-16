import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-imprimir-registro',
  templateUrl: './imprimir-registro.component.html',
  styleUrls: ['./imprimir-registro.component.css']
})
export class ImprimirRegistroComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  url: any;
  profileUrl: any;
  public myTemplate: any = ' ';

  data: any;
  constructor(public http: HttpClient, private storage: AngularFireStorage, private spinner: NgxSpinnerService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  imprimirReg(registro, proyecto, documento) {
    try {
      this.myTemplate = null;
      this.data = registro;
      const ref = this.storage.ref(proyecto + '/' + documento + '.html');
      ref.getDownloadURL()
        .pipe(switchMap((m: string) => {
          // this.url = m.replace('https://firebasestorage.googleapis.com/', '');
          this.url = m;
          return this.http.get(this.url, { responseType: 'text' }).pipe(map((data: any) => {
            this.myTemplate = data.replace(/{{([^}}]+)?}}/g, ($1, $2) =>
              $2.split('.').reduce((p, c) => p ? p[c] : '', this));
          }));
        }), takeUntil(this.unsubscribe$)).subscribe();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No existen un modelo de plantilla en el sistema, agregue uno!'
      });
    }

  }

  print() {
    this.spinner.show();
    setTimeout(() => {
      if (this.myTemplate) {
        // tslint:disable-next-line:one-variable-per-declaration
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', "width=" + screen.width + ",height=" + screen.height);
        popupWin.document.open();
        popupWin.document.write(`
    <html>
      <head>
        <title>Print tab</title>
        <link rel="stylesheet preload" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <style>
        .mm {
          border-top: 1px dotted rgb(49, 43, 43) ;
          color: #fff;
          background-color: #fff;
          height: 1px;
      }
      a {
          border-bottom:1px dotted #9999CC;
          text-decoration:none;
        }
        * {
          font-size: 0.93rem;
        }
        @media print{
          @page {size: Landscape}
          .printTD{
          display: inherit;
          }
          thead {
          display: table-row-group
          }
          td{
          overflow-wrap: break-word;
          word-break: break-word;
          }
          }
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}
  <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
    </html>`
        );
        popupWin.document.close();
      }
      this.spinner.hide();
    }, 3000);


  }
}

