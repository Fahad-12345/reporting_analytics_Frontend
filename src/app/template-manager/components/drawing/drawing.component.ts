import { Component, AfterViewInit, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise, debounceTime } from 'rxjs/operators';
import { LayoutService } from '../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DrawingUploadImageComponent } from './modal/simple-upload-image/simple-upload-image.component';
import { Config } from '@appDir/config/config';
import { SubjectService } from '@appDir/template-manager/services/subject.service';

@Component({
	selector: 'app-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.css'],
	})
export class DrawingComponent implements OnInit, AfterViewInit {
	@ViewChild('canvas') public canvas: any;

	object: any = {};
	public raw: any;
	constructor(
		public subject: SubjectService,
		public openModal: NgbModal,
		public layoutService: LayoutService,
		public changeDetector: ChangeDetectorRef,
		private config: Config,
	) {}
	private cx: CanvasRenderingContext2D | null | undefined;
	base64Img: any = '';
	subscription: any;

	ngOnInit() {
		this.subscription = this.subject.drawingRefresh.subscribe((res) => {
			if (res.length != 0) {
				if (this.object.uicomponent_name == res.uicomponent_name) {
					this.object = res
					if(this.object.answers.length === 0) {
						this.clearPoints();
					}
					this.changeDetector.markForCheck();
					this.subject.objectRefreshItem('');
				}
			}
		});
	}

	public ngAfterViewInit() {
		if (this.canvas) {
			this.canvas.nativeElement.width = this.object.width;
			this.canvas.nativeElement.height = this.object.height;
			this.cx = this.canvas.nativeElement.getContext('2d');
			if (!this.cx) throw 'Cannot get context';
			this.clearPoints();
			this.changeDetector.detectChanges();
			if (this.object.answers[0]) {
				var image = new Image();
				var that = this;
				image.onload = function () {
					that.cx.drawImage(image, 0, 0);
				};
				image.src = this.object.answers[0].answer;
			}
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	changeColor(event) {
		this.object.penColor = event.target.value;
		this.cx.strokeStyle = this.object.penColor;
	}
	changeBackgroundColor(event) {
		let pallateColor = event.target.value;
		this.cx.fillStyle = pallateColor;
		this.cx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
		this.savePointsSubject.next();
	}
	clearPoints() {
		this.cx.lineWidth = 3;
		this.cx.lineCap = 'round';
		this.cx.strokeStyle = this.object.penColor;
		this.cx.fillStyle = this.object.backgroundColor;
		this.cx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		this.captureEvents(this.canvas.nativeElement);
		this.savePointsSubject.next();
	}
	savePoints() {
		this.object.answers[0] = {answer: this.canvas.nativeElement.toDataURL()}
		this.layoutService.updateComponents()
	}
    private savePointsSubject = new Subject<void>();
	private captureEvents(canvasEl: HTMLCanvasElement) {
		this.savePointsSubject.pipe(debounceTime(100)).subscribe(() => this.savePoints());
		fromEvent(canvasEl, 'mousedown')
			.pipe(
				switchMap((e) => {
					return fromEvent(canvasEl, 'mousemove').pipe(
						takeUntil(fromEvent(canvasEl, 'mouseup')),
						takeUntil(fromEvent(canvasEl, 'mouseleave')),
						pairwise()
					);
				}),
			)
			.subscribe((res) => {
				console.log('res mouse ======>', res);
				const rect = canvasEl.getBoundingClientRect();
				const prevMouseEvent = res[0] as MouseEvent;
				const currMouseEvent = res[1] as MouseEvent;
				const prevPos = {
					x: prevMouseEvent.clientX - rect.left,
					y: prevMouseEvent.clientY - rect.top,
				};
				const currentPos = {
					x: currMouseEvent.clientX - rect.left,
					y: currMouseEvent.clientY - rect.top,
				};
				this.drawOnCanvas(prevPos, currentPos);
			});
		fromEvent(canvasEl, 'touchstart')
			.pipe(
				switchMap((e) => {
					return fromEvent(canvasEl, 'touchmove').pipe(
						takeUntil(fromEvent(canvasEl, 'touchend')),
						pairwise()
					);
				}),
			)
			.subscribe((res) => {
				console.log('res touch ======>', res);
				const rect = canvasEl.getBoundingClientRect();
				const prevMouseEvent = res[0] as MouseEvent | Touch;
				const currMouseEvent = res[1] as MouseEvent | Touch;
				const prevPos = {
					x: prevMouseEvent['changedTouches'][0].clientX - rect.left,
					y: prevMouseEvent['changedTouches'][0].clientY - rect.top,
				};
				const currentPos = {
					x: currMouseEvent['changedTouches'][0].clientX - rect.left,
					y: currMouseEvent['changedTouches'][0].clientY - rect.top,
				};
				this.drawOnCanvas(prevPos, currentPos);
			});
	}

	private drawOnCanvas(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }) {
		if (!this.cx) {
			return;
		}
		this.cx.lineWidth = 3;
		this.cx.lineCap = 'round';
		this.cx.strokeStyle = this.object.penColor;
		this.cx.fillStyle = this.object.backgroundColor;
		this.cx.beginPath();
		if (prevPos) {
			this.cx.moveTo(prevPos.x, prevPos.y);
			this.cx.lineTo(currentPos.x, currentPos.y);
			this.cx.stroke();
		}
		this.savePointsSubject.next();
	}

	openImage() {
		const imageModal = this.openModal.open(DrawingUploadImageComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
		});
		imageModal.componentInstance.imageModal = imageModal;
		imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
		imageModal.componentInstance.originalRaw = JSON.parse(JSON.stringify(this.base64Img));
		imageModal.result.then((result) => {
			if (this.layoutService.imageObj && this.layoutService.imageObj.raw) {
				this.base64Img = JSON.parse(JSON.stringify(this.layoutService.imageObj.raw));
				delete this.layoutService.imageObj.raw;
				this.object.paths = JSON.parse(JSON.stringify(this.layoutService.imageObj.paths));
				this.raw = this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + this.object.paths;
				this.drawImage();
				this.changeDetector.markForCheck();
			} else {
				return;
			}
		});
	}
	drawImage() {
		var image = new Image();
		var that = this;
		this.clearPoints();
		image.crossOrigin = 'anonymous';
		image.src = this.raw;
		image.onload = function () {
			let previousHeight = image.height;
			let ratio = that.object.height / image.height;
			image.height = ratio * image.height - 10;
			let widthRatio = image.height / previousHeight;
			image.width = widthRatio * image.width;
			let coordinates = (that.object.width - image.width) / 2;
			that.cx.drawImage(image, coordinates, 5, image.width, image.height);
			that.savePointsSubject.next();
		};
	}
}
