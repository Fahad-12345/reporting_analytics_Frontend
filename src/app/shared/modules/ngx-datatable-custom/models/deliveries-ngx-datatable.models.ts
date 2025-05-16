import { HttpCollectionSuccessResponseResultObj } from '@appDir/shared/modules/ngx-datatable-custom/models/http-responses.model';

export interface NgxDataTable {
  serviceUrl: string;
  defaultParams?: Object;
  tableName: string;
  primaryColumn: string;
  pagination: boolean;
  actionColumn: boolean;
  isFilterRequired: boolean;

  isRequestBased: boolean;
  eagerLoad: boolean;
  checkboxAble?: boolean;
  conditionalCheckboxField?: string;
  isSelectionActionButtonsRequired?: boolean;
  emitOnEachSelection?: boolean;
  tableHeaderButtonsRequired?: boolean;
  tableDateIfNotRequestBased?: any[];
  total?:number;

  /*  deleteAction: boolean;
      lazy: boolean;
    editAction: boolean;*/
  filtersNeeded?: string[];
  tableCols: NgxDataTableCol[];
  actionEntities: NgxDataTableActionEntity[];
  rowsPerPage?: number;
  actionSelection?: boolean;
  timeSlotsEdit?: boolean;
  timeSlotsDelete?: boolean;
  selectionActionButtons?: NgxDataTableButtons[];
  tableHeaderButtons?: NgxDataTableButtons[];
  disableSelectionInitially?: boolean;
  tableData?: HttpCollectionSuccessResponseResultObj;
  tab?: string;
  queryParams?: boolean;



}

export interface NgxDataTableCol {
  field?: string;
  fields?: string[];
  header: string;
  type: string; // time, string, link, method, object
  sortHead: boolean;
  searchable: boolean;
  hasTemplate: boolean;
  canAutoResize: boolean;
  draggable: boolean;
  resizeable: boolean;
  permission?:string;

  replacementKey?: string;
  isDateField?:boolean;
  date_format?:string;
  mutlipleKeys?: string; 
  objectRequiredValues?: string;
  objectRequiredValuesGlue?: string;
  timeZoneReport?:boolean;
  colstate?:any[];
  width?: number;
  link?: string;
  linkKey?: string;
  linkKeyRow?:string;
  actionEntities?: NgxDataTableActionEntity[],
  method?: string;
  canEditTimeSlot?:boolean;
}

export interface NgxDataTableActionEntity {
  type: string; // method or link;
  icon: string;
  isComment?: boolean;
  commentCounterProperty?: string;
  title: string;
  link?: string;
  method?: string;
  actionType?: string,
  hideValue?: string,
  hideDeleteProp?: string,
  hideDeleteInnerProp?: string,
  disableDeleteValue?: number,

}

export interface NgxDataTableEventEmitter {
  type: string; // method or link;
  value: any;
  paginator?: object;
}

export interface SimpleTextFilterField {
  label: string;
  type: string;
  field: string;
  pattern?: string;
  html5Meta?: string;
  value?: string;
  api_link?:string;
}

export interface NgxDataTableButtons {
  type: string; // method or link;
  title: string;
  btnClass?: string;
  showCount?: boolean;
  icon?: string;
  link?: string;
  method?: string;
  conditionalEnableField?: string
}

