import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-not-found-component',
  templateUrl: './not-found-component.component.html',
  styleUrls: ['./not-found-component.component.css']
})
export class NotFoundComponentComponent implements OnInit {
  path: string;

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.route.data.pipe(take(1))
      .subscribe((data: { path: string }) => {
        this.path = data.path;
      });
  }

  goHome() {
    this.router.navigate(['/Home']);
  }
}
