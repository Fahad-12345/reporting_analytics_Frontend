import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { CollectionComponent } from './collection.component';
import { CollectionRoutingModule } from './collection-routing.module';

@NgModule({
  declarations: [CollectionComponent],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    FdSharedModule
  ]
})
export class CollectionModule { }
