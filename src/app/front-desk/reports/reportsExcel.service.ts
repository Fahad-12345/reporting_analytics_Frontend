import { Injectable } from '@angular/core';

import { RequestService } from '@appDir/shared/services/request.service';
import { ReportType } from './report.enum';


@Injectable({
	providedIn: 'root',
})
export class ReportsExcelService {
	constructor(public requestService: RequestService) {}

getprocessedCsv(csvContent: any, reportType:number,internalColumns?) {
  const rows = csvContent.split('\n');
   console.log(rows,'rowss') 
   function parseCSV(csvContent) {
    const rows = [];
    let currentRow = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];

        if (char === '"') {
            if (insideQuotes && csvContent[i + 1] === '"') {
                // Handle escaped double quote
                currentValue += '"';
                i++; // Skip the next double quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentValue);
            currentValue = '';
        } else if (char === '\n' && !insideQuotes) {
            currentRow.push(currentValue);
            rows.push(currentRow);
            currentRow = [];
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    // Push the last value if not empty
    if (currentValue !== '') {
        currentRow.push(currentValue);
    }

    // Push the last row if not empty
    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    return rows;
} 
  
  const parsedCSV = parseCSV(csvContent);
  // console.log(typeof parsedCSV,'typeee')
  // console.log(parsedCSV,'parsedCSVData'); 
    // Split the header row into an array of columns
    if(reportType == ReportType.Denial_Report){

        const header = rows[0].split(',');
        // Filter the header to remove 'resulttype' and 'total' columns
        const filteredHeader = header.filter(column => column !== 'resulttype' && column !== 'total');
            // Update the first row with the filtered header
        rows[0] = filteredHeader.join(',');
            
            // Remove both 'resulttype' and 'total' columns from all rows except the last row
        const filteredRows = rows.map((row, index) => {
                // Skip the header row (index 0) as it contains column names
        if (index === 0) return row;  
                // Split the row into an array of columns
            const columns = row.split(',');
            
            // Remove the 'resulttype' and 'total' columns
            const columnsToExclude = [0, 1];

            const filteredColumns = columns.filter((column, columnIndex) => {
                return !columnsToExclude.includes(columnIndex);
            });
            if (index === rows.length - 1) {
                // Find the index of the 'denial_reason' column
                const denialReasonIndex = header.findIndex(column => column === 'resulttype');
                // Replace the 'denial_reason' column with the 'total' value
                filteredColumns[denialReasonIndex] = columns[header.indexOf('total')];
              }
                // Join the filtered columns back into a row
                return filteredColumns.join(',');
            });
            
            // // Join the modified rows back into a single string
             let filteredCsvContent = filteredRows.join('\n');
             return filteredCsvContent
	}
    else if(reportType == ReportType.Account_Receivable_Report){
         // Split the header row into an array of columns
         const header = rows[0].split(','); 
         // Filter the header to remove 'resulttype' and 'total' columns
         const filteredHeader = header.filter(column => column !== 'resulttype');  
         // Update the first row with the filtered header
         rows[0] = filteredHeader.join(',');
         
         // Remove both 'resulttype' and 'total' columns from all rows except the last row
         const filteredRows = rows.map((row, index) => {
             // Skip the header row (index 0) as it contains column names
             if (index === 0) return row;
             // Split the row into an array of columns
             const columns = row.split(',');
             // Remove the 'resulttype' and 'total' columns
             const filteredColumns = columns.filter((column, columnIndex) => {
                 return columnIndex !== 0 ; 
             });
             if (index >= rows.length - 2) {
               // Find the index of the 'resulttype' column
               const resulttypeIndex = header.indexOf('resulttype');
               // Replace the 'resulttype' column with the original value
               filteredColumns[resulttypeIndex] = columns[resulttypeIndex];
             }
             // Join the filtered columns back into a row
             return filteredColumns.join(',');
         });
         // // Join the modified rows back into a single string
          const filteredCsvContent = filteredRows.join('\n');
          return filteredCsvContent
    }
    else if
    (reportType == ReportType.Payment_Detail_Report){
      console.log("In Patment Detaills")
            // Split the header row into an array of columns
            //  const header = rows[0].split(',');
            const header = parsedCSV[0];
            const columnMapping = {
              'Bill/Invoice ID' : 'Bill/Invoice ID', 
              invoice_category:'Invoice Category',
              case_id: 'Case ID',
              'Bill/Invoice Date': 'Bill/Invoice Date',
              no_of_days: 'No. Of Days',
              bill_status: 'Bill Status',
              eor_status: 'EoR Status',
              denial_status: 'Denial Status',
              verification_status: 'Verification Status',
              payment_status: 'Payment Status',
              case_type: 'Case Type',
              patient_name: 'Patient Name',
              specialty: 'Specialty',
              doa: 'DOA',
              date_of_birth: 'Date Of Birth',
              practice_location: 'Practice Location',
              provider_name: 'Provider name',
              first_visit_date: 'First Visit Date',
              last_visit_date: 'Last visit Date',
              posted_date: 'Posted Date',
              check_date: 'Check Date',
              check_no: 'Check No',
              check_amount: 'Check Amount',
              'Billed/Invoice Amount' : 'Billed/Invoice Amount',
              paid_amount: 'Paid Amount',
              outstanding_amount: 'Outstanding',
              write_off: 'Write off',
              overpayment: 'Over payment',
              interest: 'Interest',     
              attorney_name: 'Attorney',
              firm_name: 'Firm name',
              payment_type: 'Payment Type',        
              paid_by: 'Paid By',
              insurance_name: 'Insurance Name', 
             'Bill/Invoice Recipient Name' : 'Bill/Invoice Recipient Name',
              'Bill/Invoice Recipient Type' : 'Bill/Invoice Recipient Type',
              denial_type:'Denial Type',
              created_at:'Created At',
              updated_at:'Updated At',
              payment_created_at:'Payment Created At',
              payment_updated_at:'Payment Updated At',                
            };
            
            
          // Convert internal column names to their corresponding CSV column names
  const internalToCsvColumnNames = Object.keys(columnMapping).reduce((acc, key) => {
    if (columnMapping[key]) {
      acc[columnMapping[key]] = key;
    }
    return acc;
  }, {});

  
  // Filter and reorder the header based on internalColumns and columnMapping
  const filteredAndReorderedHeader = internalColumns
    .map(col => internalToCsvColumnNames[col.name])
    .filter(colName => header.includes(colName));
  
    
  let indexArray = filteredAndReorderedHeader.map(colName => header.indexOf(colName));
  
  
  // Create a new array of rows starting with the filtered and reordered header
  const newRows = [filteredAndReorderedHeader];

  
  // Skip the first row since it's the header
  for (let rowIndex = 1; rowIndex < parsedCSV.length; rowIndex++) {
    const row = parsedCSV[rowIndex];
    const reorderedRow = indexArray.map(index => row[index]);
    newRows.push(reorderedRow);
    
  }
  
  // const filteredCsvContent = newRows.map(row => row.join(',')).join('\n');
  const filteredCsvContent = newRows.map(row => {
    return row.map(value => {
      let formattedValue = value;
      // Check if the value contains a comma, newline, or double quote
      if (/[\n",]/.test(formattedValue)) {
        // Escape double quotes by replacing them with two double quotes
        formattedValue = formattedValue.replace(/"/g, '""');
        // Enclose the entire value in double quotes
        formattedValue = `"${formattedValue}"`;
      }
      return formattedValue;
    }).join(',');
  }).join('\n');
  

  return filteredCsvContent;
    }
}

  }



