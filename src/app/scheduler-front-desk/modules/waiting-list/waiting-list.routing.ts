import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

//components
import { WaitingListComponent } from './waiting-list.component'
import { HomeComponent } from './component/home/home.component';


export const routes: Routes = [
  {
    path: '',
    component: WaitingListComponent
  },
  {
    path: 'home',
    component: HomeComponent,

  }


];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerWaitingListRouteModule {}