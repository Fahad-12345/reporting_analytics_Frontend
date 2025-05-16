import { KeyWordListingComponent } from './components/keyword-listing/keyword.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateMasterComponent } from './template-master.component';
import { TemplateListingComponent } from './components/template-listing/template-listing.component';
import { RolesFieldFormComponent } from './components/roles-field-form/roles-field-form.component';
import { RolesFieldListComponent } from './components/roles-field-list/roles-field-list.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { HeaderFooterComponent } from './components/header-footer/header-footer.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'template' },
  {
    path: 'template', component: TemplateMasterComponent, children: [

      { path: '', pathMatch: 'full', redirectTo: 'required-fields' },
      {
        path: 'required-fields', children: [
          { path: '', pathMatch: 'full', redirectTo: 'list' },
          {
            path: 'list', component: TemplateListingComponent
          }
        ]
	  },
      { path: '', pathMatch: 'full', redirectTo: 'keywords' },
      {
        path: 'keywords', children: [
          { path: '', pathMatch: 'full', redirectTo: 'list' },
          {
            path: 'list', component: KeyWordListingComponent
          }
        ]
	  },
	  
	  

      {
        path: 'roles-field',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'list' },
          {
            path: 'list',
            component: RolesFieldListComponent
          },
          {
            path: 'add',
            component: RolesFieldFormComponent,
            canDeactivate: [CanDeactivateFormsComponentService]
          },
          {
            path: 'edit/:id',
            component: RolesFieldFormComponent,
            canDeactivate: [CanDeactivateFormsComponentService]
          }
        ],
      },

      {
        path: 'header-footer',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'list' },
          {
            path: 'list',
            component: HeaderFooterComponent
          }
        ],
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateMasterRoutingModule { }
