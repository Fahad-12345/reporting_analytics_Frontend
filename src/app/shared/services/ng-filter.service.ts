import { Injectable } from '@angular/core';
import { FilterModel } from '../models/filter/filter-model';
import { Ifilter } from '../models/filter/ifilter';

@Injectable({
  providedIn: 'root'
})
export class NgFilterService {

  public ngFilterFields: Ifilter = new FilterModel();

  constructor() { }

  updateFilterField(name: string, status: boolean) {
    this.ngFilterFields[name] = status;
    return this.ngFilterFields;
  }
}
