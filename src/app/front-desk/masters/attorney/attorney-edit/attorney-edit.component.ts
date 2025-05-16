import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';

@Component({
  selector: 'app-attorney-edit',
  templateUrl: './attorney-edit.component.html',
  styleUrls: ['./attorney-edit.component.scss']
})
export class AttorneyEditComponent implements OnInit {

  attorney: any;
  id: number;
  constructor(private route: ActivatedRoute, private fd_services: FDServices, private logger: Logger) { 
    this.id = this.route.snapshot.params['id']
    this.logger.log('id', this.id)
  }

  ngOnInit() {
    this.getAttorney()
  }

  getAttorney() {
    this.fd_services.getAttornies().subscribe(
      res => {
          if(res.status) {
            res.data.forEach(element => {
              if(element.id == this.id) {
                this.attorney = element
                return false
              }
            });
          }
      }, 
      err => {

      }
    )
  }

}
