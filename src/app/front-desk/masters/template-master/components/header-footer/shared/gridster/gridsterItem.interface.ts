import { GridsterItemComponentInterface } from './gridsterItemComponent.interface';
export interface GridsterItem {
	x: number;
	y: number;
	rows: number;
	cols: number;
	initCallback?: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => void;
	dragEnabled?: boolean;
	resizeEnabled?: boolean;
	maxItemRows?: number;
	minItemRows?: number;
	maxItemCols?: number;
	minItemCols?: number;
	minItemArea?: number;
	maxItemArea?: number;
	[propName: string]: any;
}
