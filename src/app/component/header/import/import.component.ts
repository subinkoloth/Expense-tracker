import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessDataService } from 'src/app/services/business-data.service';
import { AlertBoxComponent } from 'src/app/shared/alert-box/alert-box.component';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  isCorrect: boolean = false;
  showPreview: boolean = true;
  displayedColumns: string[] = [
    'name',
    'amount',
    'date',
    'category',
    'payment',
    'comment',
  ];
  // Preview table columns (normalized)
  previewColumns: string[] = ['expense_name', 'amount', 'expense_date', 'expense_category', 'payment_type', 'comment'];
  previewRows: Array<{ [k: string]: string | number }> = [];

  dataSource: any = [
    { name: '', amount: '', date: '', category: '', payment: '', comment: '' },
  ];
  propertyNames: string[] = [];
  csvRecords: string[][] | null = null;
  header: boolean = false;
  constructor(public route: Router, public dialog: MatDialog, public snackBar: MatSnackBar, public businessData: BusinessDataService) { }
  ngOnInit(): void { }

  onView() {
    this.route.navigate(['dashboard']);
  }

  private mapRowToBody(headers: string[], row: string[]) {
    let body: any = {};
    let name = false, amount = false, expense_date = false, expense_category = false, payment_type = false, comment = false;
    for (let i = 0; i < headers.length; i++) {
      const header = (headers[i] || '').toString().trim().toLowerCase();
      const value = (row[i] ?? '').toString().trim();
      if (!value) { continue; }
      if (header === 'name' || header === 'expense_name' || header === 'expense name') {
        body['expense_name'] = value; name = true;
      } else if (header === 'amount' || header === 'amounts') {
        body['amount'] = parseFloat(value); amount = true;
      } else if (header === 'expense date' || header === 'date' || header === 'expense_date') {
        body['expense_date'] = value; expense_date = true;
      } else if (header === 'payment' || header === 'payment_type' || header === 'payment type') {
        body['payment_type'] = value; payment_type = true;
      } else if (header === 'expense_category' || header === 'expense category' || header === 'category') {
        body['expense_category'] = value; expense_category = true;
      } else if (header === 'comments' || header === 'comment') {
        body['comment'] = value; comment = true;
      }
    }
    return { body, flags: { name, amount, expense_date, expense_category, payment_type, comment } };
  }

  onSaveImport() {
    if (!this.csvRecords || this.csvRecords.length < 2) {
      this.snackBar.open('Please import a CSV first', '', { duration: 2000 });
      return;
    }
    // Use parsed previewRows if available
    if (this.previewRows.length === 0) {
      this.snackBar.open('No valid rows to import', '', { duration: 2000 });
      return;
    }
    for (const row of this.previewRows) {
      const body: any = { ...row };
      // Validate date format again just in case
      const parts = (body['expense_date'] || '').toString().split('/');
      if (parts.length !== 3 || parts[2].length !== 4 || parseInt(parts[1], 10) > 12) {
        this.snackBar.open('Date Format DD/MM/YYYY', '', { duration: 2000 });
        return;
      }
      if (!body['expense_category']) { body['expense_category'] = 'Unassigned'; }
      if (!body['payment_type']) { body['payment_type'] = 'Card'; }
      if (!body['comment']) { body['comment'] = 'Unassigned Expense'; }
      this.onSaveExpense(body);
    }
  }

  onSaveExpense(body: any) {
    this.businessData
      .onImportExpense(body)
      .subscribe((res: any) => {
        if (res.status === true) {
          this.snackBar.open('Imported 1 row', '', { duration: 1200 });
        }
      }, error => {
        this.snackBar.open(error.message, ' ', { duration: 2000 });
      });
  }

  importDataFromCSV(event: any) {
    const file: File = event.target.files && event.target.files[0];
    if (!file) { return; }
    const type = file.type;
    const name = file.name.toLowerCase();
    const isCsvMime = type === 'text/csv' || type === 'application/vnd.ms-excel' || name.endsWith('.csv');
    if (!isCsvMime) {
      this.dialog.open(AlertBoxComponent, { data: { type: 'error' } });
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e: any) => {
      let csv = (e.target.result || '').toString();
      const lines: string[] = csv.split(/\r\n|\n/).filter((line: string) => line.trim().length > 0);
      if (lines.length === 0) {
        this.snackBar.open('Empty CSV file', '', { duration: 2000 });
        return;
      }
      const records: string[][] = lines.map((line: string) => {
        const fields = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            fields.push(cur.trim().replace(/^['"]|['"]$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        fields.push(cur.trim().replace(/^['"]|['"]$/g, ''));
        return fields;
      });
      this.csvRecords = records;
      this.propertyNames = (records[0] || []).map(h => h.trim());
      this.previewRows = [];
      for (let j = 1; j < records.length; j++) {
        const { body, flags } = this.mapRowToBody(this.propertyNames, records[j]);
        if (flags.name && flags.amount && flags.expense_date) {
          this.previewRows.push(body);
        }
      }
      this.isCorrect = this.previewRows.length > 0;
      this.snackBar.open(`Loaded ${this.previewRows.length} valid rows`, '', { duration: 1500 });
    };
  }
}
