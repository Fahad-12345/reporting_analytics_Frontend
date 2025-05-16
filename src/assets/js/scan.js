//
// Please read scanner.js developer's guide at: http://asprise.com/document-scan-upload-image-browser/ie-chrome-firefox-scanner-docs.html
//
/** Initiates a scan */
export {
	scan
};

function scan() {
	scanner.scan(displayImagesOnPage, {
		"output_settings": [{
			"type": "return-base64",
			"format": "jpg"
		}]
	});
}
/** Processes the scan result */
function displayImagesOnPage(successful, mesg, response) {
	if (!successful) { // On error
		console.error('Failed: ' + mesg);
		return;
	}
	if (successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
		console.info('User cancelled');
		return;
	}
	var scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
	console.log('scannedImages', scannedImages)
	var pdfScanImage;
	var scanImages = [];
	for (var i = 0;
		(scannedImages instanceof Array) && i < scannedImages.length; i++) {
		var scannedImage = scannedImages[i];
		pdfScanImage = scannedImage.src;
		// console.log(pdfScanImage);
		// var pdf = dataURLtoFile(pdfScanImage, 'scan.pdf');
		//  var pdfFile = new Blob([pdfScanImage], { type: 'application/pdf' })
		//  var downloadURL = URL.createObjectURL(pdfFile);
		//  console.log("downloadUrl", downloadURL);
		scanImages.push(pdfScanImage)
		// localStorage.setItem('scanImages', JSON.stringify(pdfScanImage))


		// PDFObject.embed(pdfScanImage, "#pdf");
	}
	console.log("scanImages", scanImages)
	$("#fileUploadTxt").val(scanImages[0]);
	// alert($("#fileUploadTxt").val())
	// $("#btnFileUpload").trigger("click");
	// return imagesScanned;
	$("#fileDropLink").click()
}
/** Images scanned so far. */
var imagesScanned = [];
/** Processes a ScannedImage */
function processScannedImage(scannedImage) {
	imagesScanned.push(scannedImage);
	var elementImg = scanner.createDomElementFromModel({
		'name': 'img',
		'attributes': {
			'class': 'scanned',
			'src': scannedImage.src
		}
	});
	// document.getElementById('images').appendChild(elementImg);
}

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return file = new File([u8arr], filename, {
		type: mime
	});
	//  console.log('scan pdf', file);
	//  localStorage.setItem('scannedFile', file)
	//  return file;
}
