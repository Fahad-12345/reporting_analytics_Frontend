import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
	selector: 'drawing-camera',
	templateUrl: './camera.component.html',
	styleUrls: ['./camera.component.scss'],
})
export class DrawingCameraComponent implements OnInit {
	@Output()
	public pictureTaken = new EventEmitter<WebcamImage>();

	// toggle webcam on/off
	public showWebcam = true;
	public allowCameraSwitch = true;
	public multipleWebcamsAvailable = false;
	public deviceId: string = '';
	public errors: WebcamInitError[] = [];

	// webcam snapshot trigger
	private trigger: Subject<void> = new Subject<void>();
	// switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
	private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

	public ngOnInit(): void {
		WebcamUtil.getAvailableVideoInputs().then((mediaDevices: MediaDeviceInfo[]) => {
			this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
		});
	}

	public triggerSnapshot(): void {
		this.trigger.next();
	}

	public toggleWebcam(): void {
		this.showWebcam = !this.showWebcam;
	}

	public handleInitError(error: WebcamInitError): void {
		this.errors.push(error);
	}

	public showNextWebcam(directionOrDeviceId: boolean | string): void {
		// true => move forward through devices
		// false => move backwards through devices
		// string => move to device with given deviceId
		this.nextWebcam.next(directionOrDeviceId);
	}

	public handleImage(webcamImage: WebcamImage): void {
		console.info('received webcam image', webcamImage);
		this.pictureTaken.emit(webcamImage);
	}

	public cameraWasSwitched(deviceId: string): void {
		this.deviceId = deviceId;
	}

	public get triggerObservable(): Observable<void> {
		return this.trigger.asObservable();
	}

	public get nextWebcamObservable(): Observable<boolean | string> {
		return this.nextWebcam.asObservable();
	}
}
