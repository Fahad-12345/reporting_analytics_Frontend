export const convertToCsv = (queryData, fileName, modalElement, progressBar, initialProgress = 50) => {
    let csv = Array.isArray(queryData) ? convertArrayToCSV(queryData) : convertObjectToCSV(queryData);
    if (csv) {
        const totalChunks = Math.ceil(csv.length / 10000);
        let currentChunk = 0;

        const processChunk = () => {
            if (currentChunk < totalChunks) {
                currentChunk++;
                const progress = initialProgress + ((currentChunk / totalChunks) * 50);
                setProgress(progress, progressBar);

                setTimeout(processChunk, 0);
            } else {
                hideProgressModal(modalElement);
                const blob = new Blob([csv], { type: 'text/csv' });
                const link = document.createElement('a');
                link.download = fileName;
                link.href = window.URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        processChunk();
    }
};


const convertObjectToCSV = (obj) => {
    const escapeValue = (value) => {
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const headers: string = Object.keys(obj).join(',') + '\r\n';
    const values: string = Object.values(obj).map(escapeValue).join(',') + '\r\n';
    return headers + values;
};



const convertArrayToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    const escapeValue = (value) => {
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ',';
            line += String(array[i][index]).replace(/,/g, ' -');
        }
        str += line + '\r\n';
    }

    return str;
}

const hideProgressModal = (modalElement) => {
    if (modalElement) {
        modalElement.style.display = 'none';
    }
}

export const setProgress = (value: number, progressBar) => {
    if (progressBar) {
        progressBar.value = value;
        const progressValue = document.getElementById('progressValue');
        if (progressValue) {
            progressValue.textContent = `${Math.round(value)}%`;
        }
    }
}

export const updateRandomProgress = (currentProgress: number, progressBar: HTMLProgressElement): number => {
    if (currentProgress < 50) {
        currentProgress += Math.random() * 10; 
        if (currentProgress > 50) {
            currentProgress = 50; 
        }
        setProgress(currentProgress, progressBar); 
    }
    return currentProgress; 
};