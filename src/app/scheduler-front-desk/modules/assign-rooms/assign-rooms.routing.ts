import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { AssignRoomsComponent } from './assign-rooms.component'
import { HomeComponent } from './component/home/home.component';


export const routes: Routes = [
  {
    path: '',
    component: AssignRoomsComponent
  },
  {
    path:'home',
    component: HomeComponent
  }
  

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AssignRoomRouting {
}