import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import SignaturePad from '../../siganture-ts/signature_pad';

export enum Formates {
  PNG='PNG',
  JPG='JPG',
  SVG='SVG',
  base64='base64',
  blob='blob',
  json='json'
}

@Component({
  selector: 'ng-signature-pad',
  templateUrl: './singanture.component.html',
  styleUrls: ['./singanture.component.scss'],
})
export class SingantureComponent implements AfterViewInit {
  private signaturePad: SignaturePad;
  @ViewChild('canvas', { read: ElementRef }) canvasRef: ElementRef;

  @Input() editable = true;
  @Input() penColor = 'black';
  @Input() backgroundColor = 'transparent';

  @Input() showClearButton = true;
  @Input() clearButtonText = 'Clear';
  @Input() clearButtonClass = 'btn btn-default';

  @Input() format: Formates = Formates.blob;

  formatMetaData: Map<Formates, string> = new Map([
    [Formates.JPG, 'image/jpeg'],
    [Formates.PNG, ''],
    [Formates.SVG, 'image/svg+xml'],
  ]);

  formatExtanation: Map<Formates, string> = new Map([
    [Formates.JPG, 'jpg'],
    [Formates.PNG, 'png'],
    [Formates.SVG, 'svg'],
  ]);

  @Input() height = 150;
  @Input() width = 600;

  @Input() responsive = true;
  @Output() done = new EventEmitter();
  @Output() cleared = new EventEmitter();
  @Output() pointsChange = new EventEmitter<any>();

  constructor() {}
  ngAfterViewInit() {
    // Resize Canvas to full screen:
    if (this.responsive) {
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
      this.resizeCanvas();
    }
    this.initPad();
  }

  initPad() {
    this.signaturePad = new SignaturePad(this.canvasRef.nativeElement, {
      penColor: this.penColor,
      backgroundColor: this.backgroundColor,
    });
    this.signaturePad.penColor = this.penColor;

    if (this.editable) {
      this.signaturePad.on();
    } else {
      this.signaturePad.off();
    }
    this.signaturePad.addEventListener("endStroke", () => {
      console.log("Signature started");
      this.emitPointsAndBlob()
    })
  }

  clearPad() {
    this.signaturePad.clear();
  }

  // One could simply use Canvas#toBlob method instead, but it's just to show
  // that it can be done using result of SignaturePad#toDataURL.
  dataURLToBlob(dataURL) {
    // Code taken from https://github.com/ebidel/filer.js
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  // One could simply use Canvas#toFile method instead, but it's just to show
  // that it can be done using result of SignaturePad#toDataURL.
  dataURLtoFile(dataUrl, filename) {
    // Code taken from https://stackoverflow.com/questions/35940290/how-to-convert-base64-string-to-javascript-file-object-like-as-from-file-input-f
    var arr = dataUrl.split(',');
    var arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/),
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  get FormateType(): string {
    if (this.formatMetaData.has(this.format))
      return this.formatMetaData.get(this.format);
    return '';
  }

  get FormateExtanation(): string {
    if (this.formatExtanation.has(this.format))
      return this.formatExtanation.get(this.format);
    return '';
  }

  get FileName() {
    var milliSeconds = Date.now();
    return 'signature' + '_' + milliSeconds + '.' + this.FormateExtanation;
  }

  public get Blob() {
    const dataURL =
      this.FormateType != ''
        ? this.signaturePad.toDataURL(this.FormateType)
        : this.signaturePad.toDataURL();
    const blob = this.dataURLToBlob(dataURL);
    return blob;
  }

  public get File() {
    const base64 =
      this.FormateType != ''
        ? this.signaturePad.toDataURL(this.FormateType)
        : this.signaturePad.toDataURL();
    const file = this.dataURLtoFile(base64, this.FileName);
    return file;
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) {
      return;
    }

    const pad = canvas.closest('.signature-pad') as HTMLElement;
    if (!pad) {
      return;
    }

    const w = pad.offsetWidth;
    const h = pad.offsetWidth / (this.width / this.height);

    canvas.setAttribute('width', `${w}`);
    canvas.setAttribute('height', `${h}`);
  }


  emitPointsAndBlob() {
    this.emitPoints();
    this.emitBlob();
  }
  emitPoints() {
    const multiplier = this.canvasRef.nativeElement.offsetWidth / this.width;
    const points = JSON.parse(JSON.stringify(this.signaturePad.toData()));
    points.forEach(group => {
        group.points.forEach(pt => {
            pt.x = pt.x / multiplier;
            pt.y = pt.y / multiplier;
        });
    });
    this.pointsChange.emit(points);
  }

  emitBlob() {

    switch (this.format) {

        case Formates.base64:
            this.done.emit(this.signaturePad.toDataURL());
            break;

        case Formates.json:
            this.done.emit(this.signaturePad.toData());
            break;

        default:
            this.canvasRef.nativeElement.toBlob((blob) => {
                this.done.emit(blob);
            });
            break;
    }

}
}
