import {
	Component,
	ElementRef,
	Host,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewEncapsulation,
	Inject,
} from '@angular/core';

import { GridsterItem } from './gridsterItem.interface';
import { GridsterDraggable } from './gridsterDraggable.service';
import { GridsterResizable } from './gridsterResizable.service';
import { GridsterUtils } from './gridsterUtils.service';
import { GridsterItemComponentInterface } from './gridsterItemComponent.interface';
import { GridsterComponent } from './gridster.component';
import { LayoutService } from '@appDir/template-manager/services/layout.service';
import { UI_COMPONENT_TYPES } from '@appDir/template-manager/common/constants';
@Component({
	selector: 'gridster-item',
	templateUrl: './gridsterItem.html',
	styleUrls: ['./gridsterItem.css'],
	encapsulation: ViewEncapsulation.None,
})
export class GridsterItemComponent implements OnInit, OnDestroy, GridsterItemComponentInterface {
	@Input() item: GridsterItem;
	$item: GridsterItem;
	el: any;
	gridster: GridsterComponent;
	top: number;
	left: number;
	width: number;
	height: number;
	drag: GridsterDraggable;
	resize: GridsterResizable;
	notPlaced: boolean;
	init: boolean;
	constructor(
		@Inject(ElementRef) el: ElementRef,
		public layoutService: LayoutService,
		gridster: GridsterComponent,
		@Inject(Renderer2) public renderer: Renderer2,
		@Inject(NgZone) private zone: NgZone,
	) {
		this.el = el.nativeElement;
		this.$item = {
			cols: -1,
			rows: -1,
			x: -1,
			y: -1,
		};
		this.gridster = gridster;
		this.drag = new GridsterDraggable(this, gridster, this.zone);
		this.resize = new GridsterResizable(this, gridster, this.zone);
	}
	ngOnInit(): void {
		this.updateOptions();
		this.gridster.addItem(this);
		let oddRows = [];
		let evenRows = [];
		let allRowsItems = [];
		let allRows = [];
		let tempLastI = -1;
		loop1: for (let section of this.layoutService.template.sections) {
			for (let component of section.dashboard) {
				tempLastI++;
				if (component.id == this.item.id) {
					break loop1;
				}
			}
		}
		if (
			this.layoutService.template.sections[tempLastI] &&
			this.layoutService.template.sections[tempLastI].is_table
		) {
			for (let item of this.layoutService.template.sections[tempLastI].dashboard) {
				if (item.x == 0) {
					allRows.push({ y: item.y, rows: item.rows });
				}
			}
			for (let i = 0; i < allRows.length; i++) {
				for (let j = i + 1; j < allRows.length; j++) {
					if (allRows[i] > allRows[j]) {
						let temp = allRows[i];
						allRows[i] = allRows[j];
						allRows[j] = allRows[i];
					}
				}
			}
			let oddRowCheck = true;
			for (let item of allRows) {
				if (oddRowCheck) {
					for (let i = 0; i < item.rows; i++) {
						oddRows.push(item.y + i);
					}
					oddRowCheck = false;
				} else {
					for (let i = 0; i < item.rows; i++) {
						evenRows.push(item.y + i);
					}
					oddRowCheck = true;
				}
			}
			for (let item of this.layoutService.template.sections[tempLastI].dashboard) {
				if (item.y != 0) {
					if (oddRows.includes(item.y)) {
						item.oddRow = true;
						item.evenRow = false;
					}
					if (evenRows.includes(item.y)) {
						item.oddRow = false;
						item.evenRow = true;
					}
				}
			}
		}
	}
	updateOptions(): void {
		this.$item = GridsterUtils.merge(this.$item, this.item, {
			cols: undefined,
			rows: undefined,
			x: undefined,
			y: undefined,
			dragEnabled: undefined,
			resizeEnabled: undefined,
			maxItemRows: undefined,
			minItemRows: undefined,
			maxItemCols: undefined,
			minItemCols: undefined,
			maxItemArea: undefined,
			minItemArea: undefined,
		});
	}
	ngOnDestroy(): void {
		this.gridster.removeItem(this);
		delete this.gridster;
		this.drag.destroy();
		delete this.drag;
		this.resize.destroy();
		delete this.resize;
	}
	setSize(): void {
		let tempLastI = -1;
		loop1: for (let section of this.layoutService.template.sections) {
			tempLastI++;
			for (let component of section.dashboard) {
				if (component.id == this.item.id) {
					break loop1;
				}
			}
		}
		if (
			this.layoutService.template.sections[tempLastI] &&
			this.layoutService.template.sections[tempLastI].is_table
		) {
			if (
				(this.item.x != this.$item.x || this.item.y != this.$item.y) &&
				(this.item.obj.type == UI_COMPONENT_TYPES.TABLE_DROPDOWN || this.item.x == 0 || this.item.y == 0)
			) {
				this.$item.x = this.item.x;
				this.$item.y = this.item.y;
			}
			if (
				this.layoutService.template.sections[tempLastI].dashboard.length > 1 &&
				this.item.y > 0 &&
				this.item.x < this.layoutService.template.sections[tempLastI].dashboard[0].cols
			) {
				this.$item.cols = this.layoutService.template.sections[tempLastI].dashboard[0].cols;
				this.$item.x = 0;
				this.item.cols = this.$item.cols;
				this.item.x = this.$item.x;
			}
			if (
				this.layoutService.template.sections[tempLastI].dashboard.length > 1 &&
				this.item.x > 0 &&
				this.item.y < this.layoutService.template.sections[tempLastI].dashboard[0].rows
			) {
				this.$item.y = 0;
				this.$item.rows = this.layoutService.template.sections[tempLastI].dashboard[0].rows;
				this.item.y = this.$item.y;
				this.item.rows = this.$item.rows;
			}
			if (this.$item.x > 0 && this.$item.y > 0 && this.$item.rows > 1) {
				for (let j = 0; j < this.layoutService.template.sections[tempLastI].dashboard.length; j++) {
					if (this.layoutService.template.sections[tempLastI].dashboard[j].x == 0) {
						if (
							this.$item.y + this.$item.rows >
								this.layoutService.template.sections[tempLastI].dashboard[j].y +
									this.layoutService.template.sections[tempLastI].dashboard[j].rows &&
							this.$item.y <
								this.layoutService.template.sections[tempLastI].dashboard[j].y +
									this.layoutService.template.sections[tempLastI].dashboard[j].rows
						) {
							this.$item.rows =
								this.layoutService.template.sections[tempLastI].dashboard[j].y +
								this.layoutService.template.sections[tempLastI].dashboard[j].rows -
								this.item.y;
							this.item.rows = this.$item.rows;
							break;
						}
						if (
							this.$item.y < this.layoutService.template.sections[tempLastI].dashboard[j].y &&
							this.$item.y + this.$item.rows >
								this.layoutService.template.sections[tempLastI].dashboard[j].y
						) {
							this.$item.rows =
								this.layoutService.template.sections[tempLastI].dashboard[j].y - this.item.y;
							this.item.rows = this.$item.rows;
							break;
						}
					}
				}
			}
			if (this.$item.x > 0 && this.$item.y > 0 && this.$item.cols > 1) {
				for (let j = 0; j < this.layoutService.template.sections[tempLastI].dashboard.length; j++) {
					if (this.layoutService.template.sections[tempLastI].dashboard[j].y == 0) {
						if (
							this.$item.x + this.$item.cols >
								this.layoutService.template.sections[tempLastI].dashboard[j].x +
									this.layoutService.template.sections[tempLastI].dashboard[j].cols &&
							this.$item.x <
								this.layoutService.template.sections[tempLastI].dashboard[j].x +
									this.layoutService.template.sections[tempLastI].dashboard[j].cols
						) {
							this.$item.cols =
								this.layoutService.template.sections[tempLastI].dashboard[j].x +
								this.layoutService.template.sections[tempLastI].dashboard[j].cols -
								this.item.x;
							this.item.cols = this.$item.cols;
							break;
						}
						if (
							this.$item.x < this.layoutService.template.sections[tempLastI].dashboard[j].x &&
							this.$item.x + this.$item.cols >
								this.layoutService.template.sections[tempLastI].dashboard[j].x
						) {
							this.$item.cols =
								this.layoutService.template.sections[tempLastI].dashboard[j].x - this.item.x;
							this.item.cols = this.$item.cols;
							break;
						}
					}
				}
			}
		}

		this.renderer.setStyle(this.el, 'display', this.notPlaced ? '' : 'block');
		this.gridster.gridRenderer.updateItem(this.el, this.$item, this.renderer);
		this.updateItemSize();
	}
	updateItemSize() {
		const top = this.$item.y * this.gridster.curRowHeight;
		const left = this.$item.x * this.gridster.curColWidth;
		const width = this.$item.cols * this.gridster.curColWidth - this.gridster.$options.margin;
		const height = this.$item.rows * this.gridster.curRowHeight - this.gridster.$options.margin;
		if (!this.init && width > 0 && height > 0) {
			this.init = true;
			if (this.item.initCallback) {
				this.item.initCallback(this.item, this);
			}
			if (this.gridster.options.itemInitCallback) {
				this.gridster.options.itemInitCallback(this.item, this);
			}
			if (this.gridster.$options.scrollToNewItems) {
				this.el.scrollIntoView(false);
			}
		}
		if (width !== this.width || height !== this.height) {
			this.width = width;
			this.height = height;
			if (this.gridster.options.itemResizeCallback) {
				this.gridster.options.itemResizeCallback(this.item, this);
			}
		}
		this.top = top;
		this.left = left;
	}
	itemChanged(): void {
		if (this.gridster.options.itemChangeCallback) {
			this.gridster.options.itemChangeCallback(this.item, this);
		}
	}
	checkItemChanges(newValue: GridsterItem, oldValue: GridsterItem): void {
		if (
			newValue.rows === oldValue.rows &&
			newValue.cols === oldValue.cols &&
			newValue.x === oldValue.x &&
			newValue.y === oldValue.y
		) {
			return;
		}
		if (this.gridster.checkCollision(this.$item)) {
			this.$item.x = oldValue.x || 0;
			this.$item.y = oldValue.y || 0;
			this.$item.cols = oldValue.cols || 1;
			this.$item.rows = oldValue.rows || 1;
			this.setSize();
		} else {
			this.item.cols = this.$item.cols;
			this.item.rows = this.$item.rows;
			this.item.x = this.$item.x;
			this.item.y = this.$item.y;
			this.gridster.calculateLayoutDebounce();
			this.itemChanged();
		}
	}
	canBeDragged(): boolean {
		return (
			!this.gridster.mobile &&
			(this.$item.dragEnabled === undefined
				? this.gridster.$options.draggable.enabled
				: this.$item.dragEnabled)
		);
	}
	canBeResized(): boolean {
		return (
			!this.gridster.mobile &&
			(this.$item.resizeEnabled === undefined
				? this.gridster.$options.resizable.enabled
				: this.$item.resizeEnabled)
		);
	}
}
