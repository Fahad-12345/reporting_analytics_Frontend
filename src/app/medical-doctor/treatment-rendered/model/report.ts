import { Folder } from './folder';

export class Reports {
	private _general: Folder[];
	private _radiology: Folder[];
	private _specialty: Folder[];

	constructor(reports?) {
		this.setReports(reports);
	}

	public setReports(reports) {
		if (reports) {
			this.general = reports.General;
			this.radiology = reports.Radiology;
			this.specialty = reports.Specialty;
		}
	}

	public getReports() {
		return {
			general: this.general,
			radiology: this.radiology,
			specialty: this.specialty,
		};
	}

	public get general(): Folder[] {
		return this._general;
	}

	public set general(general: Folder[]) {
		this._general = general;
	}

	public get radiology(): Folder[] {
		return this._radiology;
	}

	public set radiology(radiology: Folder[]) {
		this._radiology = radiology;
	}

	public get specialty(): Folder[] {
		return this._specialty;
	}

	public set specialty(specialty: Folder[]) {
		this._specialty = specialty;
	}
}
