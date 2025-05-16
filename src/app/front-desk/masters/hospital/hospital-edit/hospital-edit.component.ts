import { Component, OnInit } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-hospital-edit',
  templateUrl: './hospital-edit.component.html',
  styleUrls: ['./hospital-edit.component.scss']
})
export class HospitalEditComponent implements OnInit {

  hospital: any
  id: number;

  constructor(private fd_services: FDServices, private route: ActivatedRoute, private router: Router) { 
    this.id = this.route.snapshot.params['id']
  }

  ngOnInit() {
    this.fd_services.getFacilities().subscribe(res => {
      res.data.forEach(element => {
        if(element.id == this.id) {
          this.hospital = element
          return
        }
      });
    })
  }

}
