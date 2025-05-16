/**
 * The Json object for to-do list data.
 */


import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TodoItemNode} from '../models/permission.model';


 @Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor(
    public MENU_DATA
    ) {
    if (this.MENU_DATA)
      this.initialize();
  }

  initialize() {

    const data = this.buildFileTree(this.MENU_DATA, 0);
    this.dataChange.next(data);
  }


  buildFileTree(arr: any, level: number): TodoItemNode[] {

    return arr
      .reduce((accumulator, key) => {

        const value: any = key;
        const node = new TodoItemNode();
        node.item = value.description || value.name || value.priv_title;
        node.description = value.description || value.name || value.priv_title;
        node.isChecked = value.is_checked;
        node.isSelf = value.is_self;
        node.priv_key= value.priv_key;
        node.icon = value.icon;

        if (value != null) {
         
          if (typeof value === 'object' && Object.keys(value).indexOf('submenu') !== -1) {
            node.children = this.buildFileTree(value.submenu.length ? value.submenu : value.permissions || [], level + 1);
          } else {
          }
        }
    
        let response = accumulator;
          response = accumulator.concat(node)
       
        return response;
      }, []);
  }

}
