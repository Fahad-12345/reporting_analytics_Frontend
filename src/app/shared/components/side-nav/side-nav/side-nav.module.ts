import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [
    SideNavComponent
  ],
  imports: [
    CommonModule,
    MatSidenavModule
  ],
  exports:[
    SideNavComponent
  ]
})
export class SideNavModule { }
