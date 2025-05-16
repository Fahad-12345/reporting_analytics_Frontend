import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingantureComponent } from './component/singanture/singanture.component';



@NgModule({
  declarations: [
    SingantureComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    SingantureComponent
  ]
})
export class SingatureModule { }
