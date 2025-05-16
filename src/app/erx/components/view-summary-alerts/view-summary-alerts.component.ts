import { Component, Input, OnInit, } from '@angular/core';
import { ErxService } from '@appDir/erx/erx.service';
@Component({
  selector: 'app-view-summary-alerts',
  templateUrl: './view-summary-alerts.component.html',
  styleUrls: ['./view-summary-alerts.component.scss']
})
export class ViewSummaryComponentAlerts implements OnInit {
  @Input() item: any;
  @Input() i: any;
  show={
    'dt':false,
    'dd':false,
    'df':false,
    'da':false,
    'ot':false
  }
  activeAlert="";

  constructor(public _service: ErxService) {}

  ngOnInit() {
    if(this.item.medication){
      this.item=this.item.medication
    }
    for(let i=0;i<this.item.alerts.length;i++){
      if (this.item.alerts[i].alertType=='duplicatetherapy'){
        this.show.dt=true
      } else if (this.item.alerts[i].alertType == 'drugdruginteraction') {
        this.show.dd = true
      } else if (this.item.alerts[i].alertType == 'drugfoodinteraction') {
        this.show.df = true
      } else if (this.item.alerts[i].alertType =='drugallergyinteraction'){
        this.show.da=true
      } else if (this.item.alerts[i].alertType == 'other') {
        this.show.ot = true
      }
    }
    this.showActiveCheck();
  }

  showActiveCheck(name?){
    this.activeAlert="";
    if(!name) {
      if(this.show.dt==true)
      {
        this.activeAlert="dt"
      }
      else if(this.show.dd==true)
      {
        this.activeAlert="dd"
      }
      else if(this.show.df==true)
      {
        this.activeAlert="df"
      }
      else if(this.show.da==true)
      {
        this.activeAlert="da"
      }
      else if(this.show.ot==true)
      {
        this.activeAlert="ot"
      }
    }
    else {
      if(name == 'dt')
      {
        this.activeAlert="dt"
      }
      else if(name == 'dd')
      {
        this.activeAlert="dd"
      }
      else if(name == 'df')
      {
        this.activeAlert="df"
      }
      else if(name == 'da')
      {
        this.activeAlert="da"
      }
      else if(name == 'ot')
      {
        this.activeAlert="ot"
      }
    }
  }

}
