import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from '@shared/services/main-service';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html'
})
export class SidebarRightComponent implements OnInit {
  public links=null;//= panelLinks.md.rightPanel;
  
  constructor(private router: Router,
    private mainService: MainService) {

    }
  ngOnInit(): void {
    // console.log(this.links);
    this.mainService.panelRight.subscribe(links => {
      this.links = links;
    });
  }
}
