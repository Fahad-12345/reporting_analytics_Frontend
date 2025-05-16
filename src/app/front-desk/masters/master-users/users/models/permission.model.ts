

export class Permission {

id?:number;
description?:string;
is_checked?;
name;
show_menu;
}


/**
 * Node for to-do item
 */
export class TodoItemNode {
  id: number;
  item: string;
  description: string;

  children: TodoItemNode[];
  isChecked?: boolean;
  permissions?: Array<any>;
  isSelf?: boolean;
  priv_key?:string;
  icon?:string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id: number;
  item: string;
  description: string;

  level: number;
  expandable: boolean;
  isChecked?: boolean;
  permissions?: Array<any>;
  priv_key?:string;
  icon?:string;
}
