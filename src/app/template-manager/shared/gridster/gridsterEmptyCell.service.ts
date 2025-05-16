import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GridsterUtils } from './gridsterUtils.service';
import { GridsterItem } from './gridsterItem.interface';
import { GridsterComponentInterface } from './gridster.interface';
import { SubjectService } from '../../services/subject.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Injectable()
export class GridsterEmptyCell {
	initialItem: GridsterItem | null;
	emptyCellClick: Function | null;
	emptyCellClickTouch: Function | null;
	emptyCellContextMenu: Function | null;
	emptyCellDrop: Function | null;
	emptyCellDrag: Function | null;
	emptyCellDragTouch: Function | null;
	emptyCellMMove: Function;
	emptyCellMMoveTouch: Function;
	emptyCellUp: Function;
	emptyCellUpTouch: Function;
	emptyCellMove: Function | null;
	emptyCellExit: Function | null;
	constructor(
		private gridster: GridsterComponentInterface,
		private toastrService: ToastrService,
		public subjectService: SubjectService,
		public sanitizer: DomSanitizer,
	) {}
	destroy(): void {
		delete this.initialItem;
		delete this.gridster.movingItem;
		if (this.gridster.previewStyle) {
			this.gridster.previewStyle();
		}
		delete this.gridster;
		if (this.emptyCellExit) {
			this.emptyCellExit();
			this.emptyCellExit = null;
		}
	}

	updateOptions(): void {
		if (
			this.gridster.$options.enableEmptyCellClick &&
			!this.emptyCellClick &&
			this.gridster.options.emptyCellClickCallback
		) {
			this.emptyCellClick = this.gridster?.renderer?.listen(
				this.gridster.el,
				'click',
				this.emptyCellClickCb.bind(this),
			);
			this.emptyCellClickTouch = this.gridster?.renderer?.listen(
				this.gridster.el,
				'touchend',
				this.emptyCellClickCb.bind(this),
			);
		} else if (
			!this.gridster.$options.enableEmptyCellClick &&
			this.emptyCellClick &&
			this.emptyCellClickTouch
		) {
			this.emptyCellClick();
			this.emptyCellClickTouch();
			this.emptyCellClick = null;
			this.emptyCellClickTouch = null;
		}
		if (
			this.gridster.$options.enableEmptyCellContextMenu &&
			!this.emptyCellContextMenu &&
			this.gridster.options.emptyCellContextMenuCallback
		) {
			this.emptyCellContextMenu = this.gridster?.renderer?.listen(
				this.gridster.el,
				'contextmenu',
				this.emptyCellContextMenuCb.bind(this),
			);
		} else if (!this.gridster.$options.enableEmptyCellContextMenu && this.emptyCellContextMenu) {
			this.emptyCellContextMenu();
			this.emptyCellContextMenu = null;
		}
		if (
			this.gridster.$options.enableEmptyCellDrop &&
			!this.emptyCellDrop &&
			this.gridster.options.emptyCellDropCallback
		) {
			this.emptyCellDrop = this.gridster?.renderer?.listen(
				this.gridster.el,
				'drop',
				this.emptyCellDragDrop.bind(this),
			);
			this.gridster.zone.runOutsideAngular(() => {
				this.emptyCellMove = this.gridster?.renderer?.listen(
					this.gridster.el,
					'dragover',
					this.emptyCellDragOver.bind(this),
				);
			});
			this.emptyCellExit = this.gridster?.renderer?.listen('document', 'dragend', () => {
				this.gridster.movingItem = null;
				this.gridster.previewStyle();
			});
		} else if (
			!this.gridster.$options.enableEmptyCellDrop &&
			this.emptyCellDrop &&
			this.emptyCellMove &&
			this.emptyCellExit
		) {
			this.emptyCellDrop();
			this.emptyCellMove();
			this.emptyCellExit();
			this.emptyCellMove = null;
			this.emptyCellDrop = null;
			this.emptyCellExit = null;
		}
		if (
			this.gridster.$options.enableEmptyCellDrag &&
			!this.emptyCellDrag &&
			this.gridster.options.emptyCellDragCallback
		) {
			this.emptyCellDrag = this.gridster?.renderer?.listen(
				this.gridster.el,
				'mousedown',
				this.emptyCellMouseDown.bind(this),
			);
			this.emptyCellDragTouch = this.gridster?.renderer?.listen(
				this.gridster.el,
				'touchstart',
				this.emptyCellMouseDown.bind(this),
			);
		} else if (
			!this.gridster.$options.enableEmptyCellDrag &&
			this.emptyCellDrag &&
			this.emptyCellDragTouch
		) {
			this.emptyCellDrag();
			this.emptyCellDragTouch();
			this.emptyCellDrag = null;
			this.emptyCellDragTouch = null;
		}
	}
	emptyCellClickCb(e: any): void {
		const tempItem = this.getValidItemFromEvent(e);
		this.subjectService.emptyCellClickFunc(tempItem);
		return;
	}
	emptyCellContextMenuCb(e: any): void {
		if (
			this.gridster.movingItem ||
			GridsterUtils.checkContentClassForEmptyCellClickEvent(this.gridster, e)
		) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	emptyCellDragDrop(e: any): void {
		const item = this.getValidItemFromEvent(e);
		if (!item) {
			return;
		} else {
			this.subjectService.refreshItem(item);
		}
		this.gridster.cdRef.markForCheck();
	}
	emptyCellDragOver(e: any): void {
		e.preventDefault();
		e.stopPropagation();
		const item = this.getValidItemFromEvent(e);
		if (item) {
			e.dataTransfer.dropEffect = 'move';
			this.gridster.movingItem = item;
		} else {
			e.dataTransfer.dropEffect = 'none';
			this.gridster.movingItem = null;
		}
		this.gridster.previewStyle();
	}
	emptyCellMouseDown(e: any): void {
		if (GridsterUtils.checkContentClassForEmptyCellClickEvent(this.gridster, e)) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	emptyCellMouseMove(e: any): void {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	emptyCellMouseUp(e: any): void {
		return;
	}
	getValidItemFromEvent(e: any, oldItem?: GridsterItem | null): GridsterItem | undefined {
		e.preventDefault();
		e.stopPropagation();
		GridsterUtils.checkTouchEvent(e);
		if(this.gridster?.el){
			const rect = this.gridster.el.getBoundingClientRect();
			const x = e.clientX + this.gridster.el.scrollLeft - rect.left - this.gridster.$options.margin;
			const y = e.clientY + this.gridster.el.scrollTop - rect.top - this.gridster.$options.margin;
			const item: GridsterItem = {
				x: this.gridster.pixelsToPositionX(x, Math.floor, true),
				y: this.gridster.pixelsToPositionY(y, Math.floor, true),
				cols: this.gridster.$options.defaultItemCols,
				rows: this.gridster.$options.defaultItemRows,
			};
			if (oldItem) {
				item.cols = Math.min(
					Math.abs(oldItem.x - item.x) + 1,
					this.gridster.$options.emptyCellDragMaxCols,
				);
				item.rows = Math.min(
					Math.abs(oldItem.y - item.y) + 1,
					this.gridster.$options.emptyCellDragMaxRows,
				);
				if (oldItem.x < item.x) {
					item.x = oldItem.x;
				} else if (oldItem.x - item.x > this.gridster.$options.emptyCellDragMaxCols - 1) {
					item.x = this.gridster.movingItem ? this.gridster.movingItem.x : 0;
				}
				if (oldItem.y < item.y) {
					item.y = oldItem.y;
				} else if (oldItem.y - item.y > this.gridster.$options.emptyCellDragMaxRows - 1) {
					item.y = this.gridster.movingItem ? this.gridster.movingItem.y : 0;
				}
			}
			if (!this.gridster.$options.enableOccupiedCellDrop && this.gridster.checkCollision(item)) {
				return;
			}
			return item;
		} else {
			return;
		}
	}
}
