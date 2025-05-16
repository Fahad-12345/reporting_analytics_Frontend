import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

//components
import { WaitingListComponent } from './waiting-list.component';

export const routes: Routes = [
  {
    path: '',
    component: WaitingListComponent,

  },

];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerWaitingListRoutingModule {}