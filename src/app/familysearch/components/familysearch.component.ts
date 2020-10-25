import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { isNil, reverse } from 'lodash';
import { TreeviewItem, TreeviewConfig, TreeviewComponent } from 'ngx-treeview';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'app/auth/auth.service';
export const createDirectoryItem = (name, fullpath, children = []) => {
  return {
    name: name,
    fullpath: fullpath,
    children: children
  };
};

@Component({
  selector: 'app-familysearch',
  templateUrl: './familysearch.component.html',
  styleUrls: ['./familysearch.component.scss']
})
export class FamilySearchComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild(TreeviewComponent, { static: false }) treeviewComponent: TreeviewComponent;
  // valueList: Observable<any>;
  folderList: Observable<any>;
  statusList: Observable<any>;
  searchObject: any = {};
  p = 1;
  fullpath: any;
  itemsList: any;
  itemsList2: any;
  selectedItems;
  values: any[];
  renamedObj;
  estado;
  downlineItems: any[];
  sede;
  proyecto;
  miH = innerHeight / 1.5;
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    maxHeight: this.miH
  });
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public auth: AuthService
  ) { }

  async ngOnInit() {
    const { uid } = await this.auth.getUser();
    this.afs
      .doc(`usuarios/${uid}`)
      .valueChanges()
      .pipe(
        switchMap((data: any) => {
          if (data) {
            this.estado = 'INDEXING';
            this.sede = data.sede;
            this.proyecto = data.proyecto;
            // this.valueList = this.afs.collection('Folder', ref => ref.where('proyecto.id', '==', this.proyecto.id)).valueChanges({ idField: 'id' });
            this.statusList = this.afs.collection('Folder', ref => ref.where('proyecto.id', '==', this.proyecto.id).where('status', '==', 'INDEXING').orderBy('date', 'desc')).valueChanges({ idField: 'id' });
            this.folderList = this.afs.collection('Folder', ref => ref.where('proyecto.id', '==', this.proyecto.id).orderBy('date', 'desc')).valueChanges({ idField: 'id' });
            const dirTree = require("directory-tree");
            const filteredTree = dirTree('M:\\Imagenes', { extensions: /\.(txt)$/ });
            const newKeys = {
              name: "text"
            };
            this.renamedObj = this.renameKeys(filteredTree, newKeys);
            [this.renamedObj].forEach(this.addId(1));
            return this.folderList.pipe(map((f: any) => {
              f.map((t: any) => {
                [this.renamedObj].forEach(this.updateData(t.value));
              });
              this.itemsList2 = Array.of(this.renamedObj)
                .map((value: any) => {
                  return new TreeviewItem({ text: value.text, value: value.value, children: value.children, checked: value.checked, disabled: value.disabled });
                });
            }));
          } else {
            return of(null);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addId(id: number) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function iter(o) {
      if ('path' in o) {
        o.checked = false;
        // o.disabled = true
        o.value = id++;
      }
      Object.keys(o).forEach(function (k) {
        Array.isArray(o[k]) && o[k].forEach(iter);
      });
    };
  }

  renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
      let newKey = null
      if (key === 'name') {
        newKey = newKeys.name
      } else {
        newKey = key
      }
      if (key === 'children') {
        obj[key] = obj[key].map(obj => this.renameKeys(obj, newKeys));
      }
      return {
        [newKey]: obj[key]
      };
    });
    return Object.assign({}, ...keyValues);
  }

  onSelectedChange(downlineItems: any[]): void {
    downlineItems.forEach(downlineItem => {
      const item = downlineItem.item;
      // const value = item.value;
      const texts = [item.text];
      let parent = downlineItem.parent
      while (!isNil(parent)) {
        texts.push(parent.item.text);
        parent = parent.parent;
      }
      const reverseTexts = reverse(texts);
      // const row = `${reverseTexts.join('/')} : ${value}`;
      const row = `${reverseTexts.join('/')}`;
      item.fullpath = row;
    });
    this.downlineItems = downlineItems;
  }

  onFilterChange(e) { }

  updateData(m: number) {
    return function iter(o) {
      if (o.value == m) {
        o.disabled = true;
        o.checked = true;
      }
      Object.keys(o).forEach(function (k) {
        Array.isArray(o[k]) && o[k].forEach(iter);
      });
    };
  }

  deleteData(m) {
    return function iter(o) {
      if (o.value == m) {
        o.disabled = false;
        o.checked = false;
      }
      Object.keys(o).forEach(function (k) {
        Array.isArray(o[k]) && o[k].forEach(iter);
      });
    };
  }

  eliminar(t) {
    Swal.fire({
      title: 'Are you sure to delete this folder?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Folder/${t.id}`).delete();
        [this.renamedObj].forEach(this.deleteData(t.value));
        this.itemsList2 = Array.of(this.renamedObj)
          .map((value: any) => {
            return new TreeviewItem({ text: value.text, value: value.value, children: value.children, checked: value.checked, disabled: value.disabled });
          });
        Swal.fire(
          'Deleted!',
          'The folder has been deleted.',
          'success'
        );
      }
    });

  }

  filterList(e) {
    this.estado = e.target.value;
    this.statusList = this.afs.collection('Folder', ref => ref.where('proyecto.id', '==', this.proyecto.id).where('status', '==', e.target.value).orderBy('date', 'desc')).valueChanges({ idField: 'id' });
  }

  addFolder() {
    this.downlineItems.forEach((downlineItem: any) => {
      const item = downlineItem.item;
      if (item.disabled == false) {
        const data: any = {
          pathname: item.fullpath,
          name: item.text,
          value: item.value,
          date: Date.now(),
          status: "INDEXING",
          document: 'WAITING',
          contador: 0,
          proyecto: this.proyecto
        };
        this.afs.collection('Folder').add(data);
      }
    });
  }

  goStatus(item) {
    if (item.status === 'COMPLETE') {
      const fs = require('fs');
      const shell = require('electron').shell;
      if (fs.existsSync(`M:/Reportes/${item.id}.html`)) {

        shell.openExternal(`M:/Reportes/${item.id}.html`)
        return;
      } else {
        const ruta = item.proyecto.id + '_' + item.document
        this.afs.doc(`Plantillas/${ruta}`).valueChanges().pipe(switchMap((m: any) => {
          let lst = m.campos.filter((f: any) => f.estado !== 'principal');
          var html = "<table class='noborder'><tr><td valign = 'middle=' ><big><big ><big>" + item.proyecto.nombre + "</big></big></big></td><td align = 'right'><i><b> Archives Collection Name</b></i><br/>" + item.proyecto.nombre + "</td></tr><tr><td class='smalltextmono' colspan='2'>&nbsp</td></tr></table><br/>";
          html += "<html lang='en'><head><style type='text/css'> table.border {border: 2px #000000; border-style: solid;border-collapse: collapse; width: 100%;} table.noborder { border: 0px #ffffff;  border-style: none; border-collapse: collapse; width: 100%; } tr { font-family: Sans-Serif; } tr.tablerowodd { font-family: Sans-Serif;} tr.tableroweven { background-color: #ddFFFF; font-family: Sans-Serif; color: #FF0000;} th { font-weight: bold;vertical-align: top;border-style: solid; border-width: 1px; background: d0d0d0; font-size: smaller;       padding-left: 5px; padding-right: 5px; } td { border-width: 1px; border-style: solid; padding-left: 3px; padding-right: 3px; font-size: smaller; } td.barcode { border-width: 1px; border-style: solid;padding-left: 3px;padding-right: 3px; font-family: 'IDAutomationHC39M', 'Lucida Console', Verdana;font-size: 8pt; } td.smalltextmono { border-width: 1px; padding-left: 3px; padding-right: 3px; font-family: 'Lucida Console', Verdana; font-size: 8pt; } td.yellowbkg { border-width: 1px; border-style: solid; padding-left: 3px;   padding-right: 3px; font-size: smaller; background-color: #FFFF00;} thead { display: table-header-group } @media print {.page-break { display: block;  page-break-before: always; } } </style> <meta charset = 'utf-8'><meta name = 'viewport' content = 'width=device-width, initial-scale=1, shrink-to-fit=no'><title> Informe de Operador</title></head><body>";
          html += "<table class='border'><tr><th> Date:</th><th colspan = '2' > Project Name</th><th> Document </th><th> Folder </th><th> Images </th><th> Records </th></tr><tr align = 'center'> <th colspan = '7' style = 'background:#f0f0f0'> &nbsp </th></tr>";
          html += "<tr><td align = 'center'>" + new Date().toISOString().substring(0, 10) + "</td><td align = 'center'>" + item.proyecto.nombre + "</td>  <td class='barcode' align='center'>*" + "departamento" + "*</td> <td align = 'center'>" + item.document + "</td> <td align = 'center'>" + item.pathname + "</td> <td align = 'center'>" + item.contador + "</td><td align = 'center'>" + item.contador + "</td> </tr></table><br/>";
          html += "<table class='border'><thead><tr><th></th>";
          lst.forEach(l => {
            html += "<th>" + l.nombre + "</th>";
          });
          html += "</tr></thead>";
          html += "<tbody>";

          return this.afs.collection(`Registros`, ref => ref.where('idFolder', '==', item.id)).valueChanges({ idField: 'id' }).pipe(map(r => {
            r.map((x, i) => {
              html += "<tr class='tablerowodd'>";
              html += " <td align = 'center'>" + (i + 1) + "</td>";
              lst.forEach(l => {
                html += "<td align = 'center'>" + x[l.nombre] + "</td>";
              });
              html += "</tr>";

              html += " <tr class = 'tableroweven'><td colspan =" + (lst.length + 1) + "align='left'>" + " &nbsp " + "</td></tr>";

            });
            html += "</tbody></table><br/> ";
            html += "</body></html>";
            fs.writeFile(`M:/Reportes/${item.id}.html`, html, (error) => { /* handle error */ });
            shell.openExternal(`M:/Reportes/${item.id}.html`);
          }));

        }), takeUntil(this.unsubscribe$)).subscribe();
        return;
      };
    }
    this.router.navigate(['/familysearch', item.id, item.status]);
  }

  getColor(estado) {
    switch (estado) {
      case 'WAITING':
        return 'red';
      default:
        return 'black';
    }
  }

}
