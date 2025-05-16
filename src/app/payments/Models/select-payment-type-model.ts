
export interface IShowField {
	showBillAmount(): boolean;
	showInterestAmount(): boolean;
	showOverAmount(): boolean;
}

export interface ISelectPaymentType {
	getFieldNameShow(): IShowField;
	setFieldNameShowOnSingalAction(fieldName: string, action: boolean);
	setFieldNameShowOnMultipleAction(action: boolean);
	getAmount(key: string);
	setAmount(key: string, amount: number);
	setInterestAmount(amount: number, billAmount?: number, paidAmount?: number);
	setOverAmount(amount: number);
	setBillAmount(amount: number);
	setActiveFieldBylistOfTypeAndAction(len: number, fieldName: boolean);
	setFunctionOnBill(
		types: any[],
		amount: number,
		key: string,
		billAmount?: number,
		check?: boolean,
		amountBilling?: any,
		paymentId?: number
	);
	setFunctionOnOverAmount(types: any[], amount: number, key: string, billAmount?, amountBilling?);
	setFunctionOnInterest(
		types: any[],
		amount: number,
		key: string,
		billAmount?: number,
		check?: boolean,
		amountBilling?: any,
	);
}

export class ShowFieldModel implements IShowField {
	bill = false;
	interest = false;
	overpayment = false;

	constructor(value: Object = {}) {
		Object.assign(this, value);
	}
	showBillAmount(): boolean {
		return this.bill;
	}
	showInterestAmount(): boolean {
		return this.interest;
	}
	showOverAmount(): boolean {
		return this.overpayment;
	}
}

export class SelectPaymentTypeModel implements ISelectPaymentType {
	showFieldName: IShowField = new ShowFieldModel();
	bill_amount: number;
	over_amount: number;
	interest_amount: number;
	check_amount: number;

	constructor(values: object = {}) {
		Object.assign(this, values);
	}
	/**
	 * Get field Name
	 */

	getFieldNameShow(): IShowField {
		return this.showFieldName;
	}
	/**
	 * Show amount field in screen on singal action
	 * @param action
	 */

	setFieldNameShowOnSingalAction(fieldName: string, action: boolean) {
		const name = fieldName.toLocaleLowerCase();
		this.showFieldName[name] = action;
		this.getFieldNameShow();
	}

	/**
	 * Show amount field in screen
	 * @param action
	 */

	setFieldNameShowOnMultipleAction(action: boolean) {
		if (action) {
			this.showFieldName = new ShowFieldModel({
				bill: action,
				interest: action,
				overpayment: action,
			});
		} else {
			this.showFieldName = new ShowFieldModel();
		}
	}
	/**
	 * Common function of set Payment amount
	 * @param key
	 * @param amount
	 */

	setAmount(key: string, amount: number) {
		this[key] = amount;
	}
	/**
	 * Calaculation of Intereste amount
	 * @param amount
	 */

	setInterestAmount(amount: number, billAmount?: number, paidAmount?: number) {
		this.interest_amount = amount;
		// if (this.showFieldName.showBillAmount() && this.showFieldName.showOverAmount()) {
		// 	const amount  = this.check_amount - this.validInterestAmount();
		// 	this.bill_amount = (amount / 100)* 50;
		// 	this.over_amount = this.removeNegativeAmount(this.interest_amount, this.bill_amount);
		// 	return;
		// }
		if (this.showFieldName.showBillAmount()) {
			this.bill_amount = this.check_amount - this.validInterestAmount();
			if (this.check_amount > Number(billAmount) && this.interest_amount > Number(billAmount)) {
				this.bill_amount = this.check_amount - this.validInterestAmount();
				this.over_amount = 0;
				return;
			}
			if (this.check_amount > Number(billAmount)) {
				this.bill_amount = Number(billAmount);
				this.over_amount = this.check_amount - this.validInterestAmount() - this.bill_amount;
			} else {
				if (billAmount === paidAmount) {
					this.over_amount = this.check_amount - this.validInterestAmount();
					this.bill_amount = 0;
				} else {
					this.bill_amount = this.check_amount - this.validInterestAmount();
					this.over_amount = 0;
				}
			}
			return;
		}

		// if (this.showFieldName.showOverAmount()) {
		// 	this.over_amount = this.check_amount - this.validInterestAmount();
		// 	return;
		// }
	}

	/**
	 * Calaculation of Over amount
	 * @param amount
	 */

	setOverAmount(amount: number) {
		this.over_amount = amount;
		if (this.showFieldName.showInterestAmount() && this.showFieldName.showBillAmount()) {
			if (!this.interest_amount && !this.bill_amount) {
				const amount = this.check_amount - this.validOverAmount();
				this.interest_amount = (amount / 100) * 50;
				this.bill_amount = this.removeNegativeAmount(this.interest_amount, this.over_amount);
				return;
			} else {
				// this.interest_amount = this.check_amount - this.validOverAmount();
				this.bill_amount = this.removeNegativeAmount(this.interest_amount, this.over_amount);
				return;
			}
		}

		if (this.showFieldName.showInterestAmount()) {
			this.interest_amount = this.check_amount - this.validOverAmount();
			return;
		}

		if (this.showFieldName.showBillAmount()) {
			this.bill_amount = this.check_amount - this.validOverAmount();
			return;
		}
	}
	/**
	 * Calaculation of Bill amount
	 * @param amount
	 */

	setBillAmount(amount: number) {
		this.bill_amount = amount;
		if (this.showFieldName.showInterestAmount() && this.showFieldName.showOverAmount()) {
			// this.interest_amount = this.check_amount - this.validBillAmount();
			this.over_amount = this.removeNegativeAmount(this.interest_amount, this.bill_amount);
			return;
		}

		if (this.showFieldName.showInterestAmount()) {
			this.interest_amount = this.check_amount - this.validBillAmount();
			return;
		}

		if (this.showFieldName.showOverAmount()) {
			this.over_amount = this.check_amount - this.validBillAmount();
			return;
		}
	}

	/**
	 * Common function for get amount
	 * @param Key
	 */

	getAmount(key: string): number {
		return this[key];
	}

	/**
	 * Take valid amount of Interest should be less then to check amount
	 */

	validInterestAmount(): number {
		return this.interest_amount < this.check_amount ? this.interest_amount : this.check_amount;
	}
	/**
	 * Take valid amount of Bill should be less then to check amount
	 */

	validBillAmount(): number {
		return this.bill_amount < this.check_amount ? this.bill_amount : this.check_amount;
	}

	/**
	 * Take valid amount of Over should be less then to check amount
	 */

	validOverAmount(): number {
		return this.over_amount < this.check_amount ? this.over_amount : this.check_amount;
	}

	/**
	 * Show Active field on screen
	 * @param fieldName
	 * @param len
	 */

	setActiveFieldBylistOfTypeAndAction(len: number, fieldName: boolean) {
		return len >= 2 && fieldName;
	}

	/**
	 * Remove negative amount form our payment amount
	 * @param amount_one
	 * @param amount_second
	 */

	removeNegativeAmount(amount_one: number, amount_second) {
		return this.check_amount - (amount_one + amount_second) > -0.0
			? this.check_amount - (amount_one + amount_second)
			: 0.0;
	}

	setFunctionOnBill(
		types: any[],
		amount,
		key: string,
		billAmount?,
		check?: boolean,
		amountBilling?: any,
		paymentId?: number
	) {
		const typeList = types.map((d) => String(d.name).toLocaleLowerCase());
		const type = typeList.includes(key);

		if(paymentId){
			if (types.length === 1 && type && amountBilling.bill === amountBilling.paid){
					this.over_amount = 0;
					this.bill_amount;
					this.over_amount = this.check_amount - (+billAmount);
					this.bill_amount = +billAmount;
				return this.bill_amount;
			}
			if(Number(amountBilling.bill) > Number(amountBilling.paid)){
				const finalPaidAmount = Number(amountBilling.paid) - Number(amountBilling.checkoutAmount);
				let remainingAmount  = (Number(amountBilling.bill) -  finalPaidAmount);
					if(this.check_amount >  remainingAmount){
						this.bill_amount = remainingAmount;
						this.over_amount = this.check_amount - this.bill_amount;
						return this.bill_amount;
					}else{
						this.over_amount = 0;
						return this.check_amount;
					}
			}else{
				this.over_amount = 0;
				return this.check_amount;
			}
		}

		//check for interest type on singal interest type so bill amount will be zero and overpayment zero
		if(types.length === 1 && typeList.includes('interest') ){
			this.over_amount = null;
			return 0;
		}
		// check for singal bill items
		if (types.length === 1 && type && amountBilling.bill === amountBilling.paid) {
			this.over_amount = this.check_amount;
			return 0;
		}
		// check for singal bill items and bill not paid
		if (types.length >= 1 && type && amountBilling.bill != amountBilling.paid) {
			let paidAmount =  Number(amountBilling.bill) - Number(amountBilling.paid);
			if((this.check_amount > Number(paidAmount)) && amountBilling.paid != 0 ){
				this.bill_amount = Number(paidAmount);
				this.over_amount = this.check_amount - this.bill_amount;
				return this.bill_amount;
			}else if((this.check_amount === Number(paidAmount) || (this.check_amount < Number(paidAmount)) && amountBilling.paid != 0)){
				this.over_amount = 0 ;
				return this.check_amount;
			}
			if (this.check_amount > Number(billAmount)) {
				this.over_amount = this.check_amount - Number(billAmount);
				this.bill_amount = Number(billAmount);
				return this.bill_amount;
				
			}
			// this.check_amount<Number(billAmount) ||
			else if(  this.check_amount === Number(billAmount)) {
				this.over_amount = 0;
				this.bill_amount = Number(billAmount);
				return this.bill_amount;
			}
			else{
				this.over_amount = 0;
				return this.check_amount;
			}
		}
		// check for bill is paid
		if (amountBilling.bill === amountBilling.paid) {
			return 0;
		}

		if (
			this.check_amount > Number(amountBilling.bill) &&
			this.interest_amount > Number(amountBilling.bill)
		) {
			this.bill_amount = this.check_amount - this.validInterestAmount();
			if (Number(amountBilling.bill) > Number(amountBilling.paid)) {
				if (this.bill_amount > Number(amountBilling.paid)) {
					const sum = this.bill_amount + Number(amountBilling.paid);
					if (sum > Number(amountBilling.bill)) {
						this.over_amount = Number(amountBilling.paid);
						return this.bill_amount - Number(amountBilling.paid);
					} else {
						this.over_amount = null;
						return this.bill_amount;
					}
					// return sum > Number(amountBilling.bill) ? this.bill_amount - Number(amountBilling.paid) : this.bill_amount;
				} else {
					this.over_amount = null;
					return this.bill_amount;
				}
			} else {
				return 0;
			}
		}
		if (types.length === 1 && type) {
			if (this.check_amount > Number(billAmount)) {
				// return Number(billAmount);
				if (amountBilling.bill != amountBilling.paid) {
					return this.check_amount - Number(billAmount);
				} else {
					return Number(billAmount);
				}
			} else {
				if (check) {
					return this.check_amount;
				} else {
					return 0;
				}
			}
		} else if (types.length > 1 && type) {
			if (this.check_amount > Number(billAmount)) {
				this.bill_amount = this.check_amount - this.validInterestAmount();
				const sum = this.bill_amount + Number(amountBilling.paid);
				if (sum > Number(amountBilling.bill)) {
					this.over_amount = Number(amountBilling.paid);
					const resultOfPaidAndBill = Number(amountBilling.bill) + Number(amountBilling.paid);
					if (this.bill_amount > resultOfPaidAndBill) {
						return Number(amountBilling.bill) - Number(amountBilling.paid);
					} else {
						return this.bill_amount - Number(amountBilling.paid);
					}
				} else {
					this.over_amount = null;
					return this.bill_amount;
				}
			} else {
				if (check) {
					return this.check_amount - this.validInterestAmount();
				} else {
					return check ? 0 : amount;
				}
			}
		} else {
			return amount;
		}
	}

	setFunctionOnInterest(
		types: any[],
		amount,
		key: string,
		billAmount?,
		check?: boolean,
		amountBilling?: any,
	) {
		const typeList = types.map((d) => String(d.name).toLocaleLowerCase());
		const type = typeList.includes(key);
		if (types.length === 1 && type) {
			this.over_amount = null;
			return this.check_amount;
		}
		if (types.length === 1 && type) {
			if (this.check_amount > Number(billAmount)) {
				// return Number(billAmount);
				if (amountBilling.bill != amountBilling.paid) {
					return this.check_amount - Number(billAmount);
				} else {
					return Number(billAmount);
				}
			} else {
				if (check) {
					return this.check_amount;
				} else {
					return 0;
				}
			}
		} else if (types.length > 1 && type) {
			if (this.check_amount > Number(billAmount)) {
				return Number(billAmount);
			} else {
				if (check) {
					return this.check_amount - this.validInterestAmount();
				} else {
					return check ? 0 : amount;
				}
			}
		} else {
			return amount;
		}
	}

	setFunctionOnOverAmount(types: any[], amount, key: string, bill?, amountBilling?: any) {
		const typeList = types.map((d) => String(d.name).toLocaleLowerCase());
		const type = typeList.includes(key);
		if (types.length === 1) {
			return type ? this.check_amount : this.over_amount;
		}
		if(types.length == 2  && type && typeList.includes('interest') ){
			return  this.check_amount;
		}
		if (
			this.check_amount > Number(amountBilling.bill) &&
			this.interest_amount > Number(amountBilling.bill) &&
			Number(amountBilling.bill) != Number(amountBilling.paid)
		) {
			return this.over_amount;
		}
        if (bill.checkAmount<bill.billAmount){
			this.over_amount=0;
			return this.over_amount;
		}
		if (bill.checkAmount!=bill.billAmount){
		return bill.checkAmount - (bill.billAmount);
		}
		else {
			this.over_amount=0;
			return this.over_amount;
		}
	}
}
