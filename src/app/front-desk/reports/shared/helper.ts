export function removeEmptyKeysFromObject(obj) {
	Object.keys(obj).forEach((key) => {
		if (
			Object.prototype.toString.call(obj[key]) === '[object Date]' &&
			(obj[key].toString().length === 0 || obj[key].toString() === 'Invalid Date')
		) {
			delete obj[key];
		} else if (obj[key] && typeof obj[key] === 'object') {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] && Array.isArray(obj[key]) && obj[key].length == 0) {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] == null || obj[key] === '' || obj[key] === undefined) {
			delete obj[key];
		}

		if (
			obj[key] &&
			typeof obj[key] === 'object' &&
			Object.keys(obj[key]).length === 0 &&
			Object.prototype.toString.call(obj[key]) !== '[object Date]' &&
			Object.prototype.toString.call(obj[key]) !== '[object File]'
		) {
			delete obj[key];
		}
	});
	return obj;
}

export function convertDateFormat(inputDate) {
	const formattedDate = inputDate.replace(/-/g, '/');
  
	return formattedDate;
  }
  
export function  calculateTotalAmount(data, propertyName) {
	return data.reduce((total, item) => total + Number(item[propertyName] || 0), 0).toFixed(2);
  }
  export function paymentSlugsHandler(form, allPaymnetsStatus) {
    const paymentSlug = allPaymnetsStatus.find(
      (status) => status?.id == form?.status_id
    );
    form['status_slug'] = paymentSlug?.slug;
    return form;
  }