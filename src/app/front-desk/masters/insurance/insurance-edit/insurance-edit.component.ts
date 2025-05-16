import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-insurance-edit',
  templateUrl: './insurance-edit.component.html',
  styleUrls: ['./insurance-edit.component.scss']
})
export class InsuranceEditComponent implements OnInit {

  insurance: any;
  id: number;
  constructor(private route: ActivatedRoute, private fd_services: FDServices, private logger: Logger, private toastrService: ToastrService) { 
    this.id = this.route.snapshot.params['id']
    this.logger.log('id', this.id)
  }

  ngOnInit() {
    this.getInsurances()
  }

  getInsurances() {
    this.fd_services.insurance_details().subscribe(
      res => {
          if(res.status) {
            res.data.forEach(element => {
              if(element.id == this.id) {
                this.insurance = element
                return false
              }
            });
          }
      }, 
      err => {
          this.toastrService.error(err.message, 'Error');
      }
    )
  }
}
