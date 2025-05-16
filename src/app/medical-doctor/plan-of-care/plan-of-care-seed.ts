import { SeededRadiology } from '../md-shared/seededInfo';

export class PlanOfCareSeed {
	private _ctScans: SeededRadiology;
	private _ultrasounds: SeededRadiology;
	private _radiologies: SeededRadiology[];
	private _mammographies: SeededRadiology[];
	private _mrAngiographies: SeededRadiology[];
	private _ctaAngiographies: SeededRadiology[];
	private _mris: SeededRadiology[];
	private _dexa: SeededRadiology[];
	private _drugs: any[];

	constructor(seeds) {
		this.setSeeds(seeds);
	}

	public setSeeds(seeds) {
		if (seeds) {
			this.ctScans = seeds.ctScans;
			this.ultrasounds = seeds.ultrasounds;
			this.radiologies = seeds.radiologies;
			this.mammographies = seeds.mammographies;
			this.mrAngiographies = seeds.mrAngiographies;
			this.ctaAngiographies = seeds.ctaAngiographies;
			this.mris = seeds.mris;
			this.dexa = seeds.dexa;
			this.drugs = seeds.drugs;
		}
	}
	public getSeeds() {
		return {
			ctScans: this.ctScans,
			ultrasounds: this.ultrasounds,
			radiologies: this.radiologies,
			mammographies: this.mammographies,
			mrAngiographies: this.mrAngiographies,
			ctaAngiographies: this.ctaAngiographies,
			mris: this.mris,
			dexa: this.dexa,
			drugs: this.drugs,
		};
	}

	public get ctScans(): SeededRadiology {
		return this._ctScans;
	}

	public set ctScans(ctScans: SeededRadiology) {
		this._ctScans = ctScans;
	}

	public get ultrasounds(): SeededRadiology {
		return this._ultrasounds;
	}

	public set ultrasounds(ultrasounds: SeededRadiology) {
		this._ultrasounds = ultrasounds;
	}

	public get radiologies(): SeededRadiology[] {
		return this._radiologies;
	}

	public set radiologies(radiologies: SeededRadiology[]) {
		this._radiologies = radiologies;
	}

	public get mammographies(): SeededRadiology[] {
		return this._mammographies;
	}

	public set mammographies(mammographies: SeededRadiology[]) {
		this._mammographies = mammographies;
	}

	public get mrAngiographies(): SeededRadiology[] {
		return this._mrAngiographies;
	}

	public set mrAngiographies(mrAngiographies: SeededRadiology[]) {
		this._mrAngiographies = mrAngiographies;
	}

	public get ctaAngiographies(): SeededRadiology[] {
		return this._ctaAngiographies;
	}

	public set ctaAngiographies(ctaAngiographies: SeededRadiology[]) {
		this._ctaAngiographies = ctaAngiographies;
	}

	public get mris(): SeededRadiology[] {
		return this._mris;
	}

	public set mris(mris: SeededRadiology[]) {
		this._mris = mris;
	}

	public get dexa(): SeededRadiology[] {
		return this._dexa;
	}

	public set dexa(dexa: SeededRadiology[]) {
		this._dexa = dexa;
	}

	public get drugs(): any[] {
		return this._drugs;
	}

	public set drugs(drugs: any[]) {
		this._drugs = drugs;
	}
}
