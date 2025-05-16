import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  public addItem = new BehaviorSubject<any>([]);
  castItem = this.addItem.asObservable();
  public copyPasteItem = new BehaviorSubject<any>([]);
  castPasteItem = this.copyPasteItem.asObservable();
  public instanceRefresh = new BehaviorSubject<any>([]);
  castInstanceRefresh = this.instanceRefresh.asObservable();
  public gridRefresh = new BehaviorSubject<any>([]);
  castGridRefresh = this.gridRefresh.asObservable();
  public emptyCellClick = new BehaviorSubject<any>([]);
  castEmptyCellClick = this.emptyCellClick.asObservable();
	public imageRefresh = new BehaviorSubject<any>([]);
	public inputRefresh = new BehaviorSubject<any>([]);
	public simpleImageRefresh = new BehaviorSubject<any>([]);
	public textRefresh = new BehaviorSubject<any>([]);
	// castObjectRefresh = this.textRefresh.asObservable();
  constructor() { }
  public resizeRefreshItem(item) {
		this.resize.next(item);
	}

	public resize = new BehaviorSubject<any>([]);
	castResize = this.resize.asObservable();
  public gridRefreshItem(item) {
    this.gridRefresh.next(item)
  }
  public refreshItem(item) {
    this.addItem.next(item)
  }
  public objectRefreshItem(item) {
		switch (item.type) {
			case "image":
				this.imageRefresh.next(item);
				break;
			case "input":
				this.inputRefresh.next(item);
				break;
			case "simpleImage":
				this.simpleImageRefresh.next(item);
				break;
			case "text":
				this.textRefresh.next(item);
				break;
		}
	}
  public instanceRefreshCheck(item) {
    this.instanceRefresh.next(item)
  }
  public emptyCellClickFunc(item) {
    this.emptyCellClick.next(item)
  }
  public pasteItem(item) {
    this.copyPasteItem.next(item)
  }
}
