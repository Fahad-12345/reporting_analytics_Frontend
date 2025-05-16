import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialityComponent } from './speciality/speciality.component';
import { ManualSpecialitiesComponent } from './manual-specialities.component';
// import { HbotNotesComponent } from './hbot-notes/hbot-notes.component';
import { SpecialityMainFormComponent } from './speciality-form/speciality-form.component';

const routes: Routes = [
  {
    path: "",
    component: ManualSpecialitiesComponent,
    children: [
      // {
      //   path: 'hbot-notes',
      //   component: HbotNotesComponent,
      //   data: {
      //     title: 'Hbot Notes'
      //   }
      // },
      {
        path: "",
        component: SpecialityComponent,
        // children: [
        //   {
        //     path: 'hbot-notes',
        //     component: HbotNotesComponent
        //   },
        //   {
        //     path: '',
        //     component: SpecialityFormComponent
        //   }
        // ]
      },

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManualSpecialitiesRoutingModule { }
