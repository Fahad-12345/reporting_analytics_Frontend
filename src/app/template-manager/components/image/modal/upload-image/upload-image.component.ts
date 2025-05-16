import {
	Component,
	OnInit,
	Input,
	ChangeDetectorRef,
	ChangeDetectionStrategy
} from '@angular/core';
import { MainServiceTemp } from '../../../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../../../../services/layout.service';
import { Platform } from '@angular/cdk/platform';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { fabric } from "fabric";
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH, FABRIC_OBJECT_PROPS } from '@appDir/template-manager/common/constants';
import { imageLabelPoint, imageLabelProperties } from '@appDir/template-manager/common/ui-props';
import { replaceAll } from '@appDir/template-manager/utils/common-utils';
import * as Hammer from 'hammerjs'

@Component({
	selector: 'app-upload-image',
	templateUrl: './upload-image.component.html',
	styleUrls: ['./upload-image.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadImageComponent implements OnInit {
	@Input() imageModal: NgbModalRef;
	@Input() openObject: imageLabelProperties;
	@Input() originalRaw: string;

	canvas: fabric.canvas;
	mousePosition = {
		x: 0,
		y: 0
	  };
	fileData: File = null;
	previewUrl: string | ArrayBuffer = null;
	fileUploadProgress: string = null;
	uploadedFilePath: string[] = [];
	filePath: string = null;
	data: imageLabelPoint[] = [];
	standardZoom: number
	standardVPT: number
	isTablet: boolean
	constructor(
		public mainService: MainServiceTemp,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		public layoutService: LayoutService,
		public changeDetector: ChangeDetectorRef,
		private platform: Platform
	) {}
	ngOnInit(): void {
		this.canvas = new fabric.Canvas('image-canvas', {
			preserveObjectStacking: true,
			height: DEFAULT_CANVAS_HEIGHT, 
			width: DEFAULT_CANVAS_WIDTH
		});
		this.canvas.selection = false
		this.setHammerEvents()
		this.setCanvasEvents()
		this.standardZoom = this.canvas.getZoom()
		this.standardVPT = JSON.parse(JSON.stringify(this.canvas.viewportTransform))
		if (this.openObject && this.openObject.paths.length !== 0) {
			this.data = this.openObject.data;
			this.previewUrl = this.originalRaw;
			this.uploadedFilePath.push(this.openObject.paths[0]);
			this.drawImage()
		}
	}
	setHammerEvents (): void {
		let hammer = new Hammer.Manager(this.canvas.getSelectionElement(),
			{
			recognizers: [
				[Hammer.Pan, { enable: true , threshold:5, direction: Hammer.DIRECTION_ALL }],
				[Hammer.Tap, { enable: true }]
			]
			});
		hammer.add(new Hammer.Pinch({}));
		hammer.get('pinch').set({ enable: true })
		hammer.on('tap', (evt) => {
			let pointer = this.canvas.getPointer({
				clientX: evt.srcEvent.clientX,
				clientY: evt.srcEvent.clientY
			});
			this.markImage(pointer);
		});
		hammer.on('panmove', (evt) => {
			evt.preventDefault()
			var vpt = this.canvas.viewportTransform;
			vpt[4] += evt.deltaX * 0.04;
			vpt[5] += evt.deltaY * 0.04;
			this.canvas.requestRenderAll();
		});
		hammer.on('panend', (evt) => {
			this.canvas.setViewportTransform(this.canvas.viewportTransform);
		});
		hammer.on('pinch', (evt) => {
			var delta = evt.scale;
			var zoom = this.canvas.getZoom();
			if(delta>1) {
				zoom = zoom + (0.005 * delta);
			} else {
				zoom = zoom - (0.05 * delta);
			}
			if (zoom > 10) zoom = 10;
			if (zoom < 1) zoom = 1;
			this.canvas.zoomToPoint({ x: evt.center.x, y: evt.center.y }, zoom);
			evt.srcEvent.preventDefault();
			evt.srcEvent.stopPropagation();
			var vpt = this.canvas.viewportTransform;
			if (zoom < 400 / 1000) {
			vpt[4] = 200 - 1000 * zoom / 2;
			vpt[5] = 200 - 1000 * zoom / 2;
			} else {
			if (vpt[4] >= 0) {
				vpt[4] = 0;
			} else if (vpt[4] < this.canvas.getWidth() - 1000 * zoom) {
				vpt[4] = this.canvas.getWidth() - 1000 * zoom;
			}
			if (vpt[5] >= 0) {
				vpt[5] = 0;
			} else if (vpt[5] < this.canvas.getHeight() - 1000 * zoom) {
				vpt[5] = this.canvas.getHeight() - 1000 * zoom;
			}
			}
		});
		
	}

	setCanvasEvents(): void {
		this.canvas.on('mouse:wheel', (opt) => {
		var delta = opt.e.deltaY;
		var zoom = this.canvas.getZoom();
		zoom *= 0.999 ** delta;
		if (zoom > 20) zoom = 20;
		if (zoom < 0.01) zoom = 0.01;
		this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
		opt.e.preventDefault();
		opt.e.stopPropagation();
		var vpt = this.canvas.viewportTransform;
		if (zoom < 400 / 1000) {
			vpt[4] = 200 - 1000 * zoom / 2;
			vpt[5] = 200 - 1000 * zoom / 2;
		} else {
			if (vpt[4] >= 0) {
			vpt[4] = 0;
			} else if (vpt[4] < this.canvas.getWidth() - 1000 * zoom) {
			vpt[4] = this.canvas.getWidth() - 1000 * zoom;
			}
			if (vpt[5] >= 0) {
			vpt[5] = 0;
			} else if (vpt[5] < this.canvas.getHeight() - 1000 * zoom) {
			vpt[5] = this.canvas.getHeight() - 1000 * zoom;
			}
		}
		})
	}

	drawImage(): void {
		this.canvas.clear();
		fabric.Image.fromURL(this.previewUrl, (oImg) => {
			let container = document.getElementById('canvas-image-container');
			if(container && container.clientHeight>0)this.canvas.setHeight(container.clientHeight)
			const scaleY = this.canvas.height / oImg.height
			let actualScale: number = 1
			if( scaleY < 1) {
				actualScale = scaleY
			}
			this.canvas.setWidth(oImg.width * actualScale)
			oImg.set({
			  "left": 0,
			  "top": 0,
			  "scaleX": actualScale,
			  "scaleY": actualScale,
			  ...FABRIC_OBJECT_PROPS
			})
			this.canvas.add(oImg);
			let i = 0;
			this.data.filter((element) => {
				i++;
				const color = element.isSelected ? 'green' : 'red'
				var object = new fabric.Circle({
					radius: 2,
					fill: color,
					left: element.offsetX,
					top: element.offsetY,
					...FABRIC_OBJECT_PROPS
				});
				this.canvas.add(object);
				if(!this.openObject.hideLabels) {
					this.canvas.add(new fabric.Text(element.label.toString(), { 
						left: element.offsetX + 10, 
						top: element.offsetY - 2, 
						fill: 'black',
						fontSize: 8,
						...FABRIC_OBJECT_PROPS
					}));
				}
			});
			this.canvas.renderAll();
			this.changeDetector.markForCheck();
		});
	}

	fileProgress(fileInput: Event): void {
		const element = fileInput.currentTarget as HTMLInputElement
		if (element.value !== '') {
			this.filePath = element.value;
			this.fileData = <File>element.files[0]
			this.preview();
		}
	}

	preview(): void {
		var mimeType = this.fileData.type;
		if (mimeType.match(/image\/*/) === null) {
			return;
		}

		var reader = new FileReader();

		reader.readAsDataURL(this.fileData);
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
			this.originalRaw = JSON.parse(JSON.stringify(this.previewUrl));
			this.data = [];
			this.drawImage()
		};
	}
	public makeText(): void {
		for (let x = 0; x < this.layoutService.template.sections.length; x++) {
			for (let r = 0; r < this.layoutService.template.sections[x].dashboard.length; r++) {
				if (
					this.layoutService.template.sections[x].dashboard[r].obj.uicomponent_name ===
					this.openObject.uicomponent_name
				) {
					this.layoutService.template.sections[x].dashboard[r].obj.answers = [];
					for (let k = 0; k < this.data.length; k++) {
						if(this.data[k].isSelected) {
							let labelAndText = this.data[k].label;
							if(this.openObject.enableTextInput) {
								labelAndText += ` ${this.data[k].text}`	
							}
							if (this.data[k].linkedStatementCheck) {
								let tempAnswer = this.data[k].linkedStatement;
								tempAnswer = replaceAll(tempAnswer, '#input', labelAndText);
								this.layoutService.template.sections[x].dashboard[r].obj.answers.push({
									answer: tempAnswer,
								});
							} else {
								this.layoutService.template.sections[x].dashboard[r].obj.answers.push({
									answer: labelAndText,
								});
							}
						}
						
					}
				}
			}
		}

		this.layoutService.updateComponents();
		}
	onSubmit(): void {
		if (this.fileData == null) {
			this.toastrService.success('Successfully uploaded!!');
			this.layoutService.imageObj = {
				paths: this.uploadedFilePath,
				data: this.data,
				raw: this.originalRaw,
			};
			this.imageModal.close();
		} else {
			this.layoutService.isLoaderPending.next(true);
			const formData = new FormData();
			formData.append('images', this.fileData, this.fileData.name);
			this.requestService
				.sendRequest(
					TemaplateManagerUrlsEnum.uploadImage,
					'POST',
					REQUEST_SERVERS.templateManagerUrl,
					formData,
				)
				.subscribe(
					(res: any) => {
						for (let image of res.data[0]) {
							this.uploadedFilePath.push(image['images']);
						}
						this.toastrService.success('Successfully uploaded!!');
						this.layoutService.imageObj = {
							paths: [this.uploadedFilePath[this.uploadedFilePath.length-1]],
							data: this.data,
							raw: this.originalRaw,
						};
						this.imageModal.close();
						this.layoutService.isLoaderPending.next(false);
					},
					(err) => {
						this.toastrService.error(err.message, 'Error', { timeOut: 6000 });
						this.layoutService.isLoaderPending.next(false);
					},
				);
		}

		if (this.layoutService.editorView === true) {
			this.makeText();
		}
		this.changeDetector.markForCheck();
	}

	markImage(pointer): void {
		let x = pointer.x
		let y = pointer.y
		for(let point of this.data) {
			if((x <= point.offsetX+5 && x >= point.offsetX-5) && (y <= point.offsetY+5 && y >= point.offsetY-5)) {
				point.isSelected = !point.isSelected
				this.drawImage();
				return
			}
		}
		if(this.layoutService.editorView === true) return	// Don't mark image in editor view
		this.data.push({
			offsetX: x,
			offsetY: y,
			ratio: 1,
			isSelected: false,
			label: `Label ${this.data.length+1}`,
			text: '',
			linkedStatement: '',
			linkedStatementCheck: false,
		});
		this.drawImage();
	}

	toggleLinkedStatement(optionIndex): void {
		this.data[optionIndex].linkedStatementCheck = !this.data[optionIndex].linkedStatementCheck;
	}
	deleteOption(index): void {
		this.previewUrl = JSON.parse(JSON.stringify(this.originalRaw));
		this.data.splice(index, 1);
		this.drawImage();
	}
	resetImage(): void {
		this.canvas.setViewportTransform(this.standardVPT)
		this.canvas.setZoom(this.standardZoom)
	}
}
