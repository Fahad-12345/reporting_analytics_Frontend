import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePlanComponent } from './components/time-plan/time-plan.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TwelveHoursPipe } from '@appDir/shared/pipes/twelvehours.pipe';
import { SharedModule } from '@appDir/shared/shared.module';
import { ReplicateToAllFormComponent } from './components/replicate-to-all/replicate-to-all.component';
@NgModule({
  declarations: [TimePlanComponent,ReplicateToAllFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    TimePlanComponent
  ],
  entryComponents:[ReplicateToAllFormComponent]
})
export class MastersSharedModule { }
