import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

//components
import { AddToBeScheduledListComponent } from './add-to-be-scheduled-list.component'
import { HomeComponent } from './component/home/home.component';


export const routes: Routes = [
  {
    path: '',
    component: AddToBeScheduledListComponent
  },
  {
    path: 'home',
    component: HomeComponent
  }


];



@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerAddToBeScheduleRoutingModule {}