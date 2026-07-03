import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { ChartConfiguration } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { BusinessDataService } from 'src/app/services/business-data.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-show-chart',
  templateUrl: './show-chart.component.html',
  styleUrls: ['./show-chart.component.scss'],
})
export class ShowChartComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public businessData: BusinessDataService,
    public route: Router,
  ) { }

  chartType: any = [];
  public pieChartLabels: any = [];
  pieValues: any = [];
  pieChartDatasets: any;
  years: any = []; //hashmap keys
  selectedYear = '';
  allMonths: any = [];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  onHome() {
    this.businessData.pieDialogRef.close();
    this.businessData.onHome();
  }

  public pieColors: string[] = [
    '#6366f1',
    '#3b82f6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
    '#f43f5e',
    '#06b6d4'
  ];

  ngOnInit(): void {
    this.chartType = this.businessData.chartType;
    this.pieChartLabels = this.businessData.pieLabels;
    this.pieChartDatasets = [
      {
        data: this.businessData.piedata,
        backgroundColor: this.pieColors,
      },
    ];
    this.years = [];
    for (let key in this.businessData.hashmap) {
      this.years.push(key);
    }
    if (this.chartType === 'bar' && this.years.length > 0) {
      this.years.sort((a: any, b: any) => b - a);
      this.selectedYear = this.years[0];
      this.onSelectionChange({ value: this.selectedYear });
    }
  }

  onSelectionChange(event: any) {
    this.allMonths = {
      'Jan': 0,
      'Feb': 0,
      'Mar': 0,
      'Apr': 0,
      'May': 0,
      'Jun': 0,
      'Jul': 0,
      'Aug': 0,
      'Sep': 0,
      'Oct': 0,
      'Nov': 0,
      'Dec': 0,
    };
    const data = this.businessData.hashmap[event.value];
    for (let entry of data) {
      this.allMonths[entry[0]] += entry[1];
    }
    let vals: any = [];
    for (let key in this.allMonths) {
      vals.push(this.allMonths[key]);
    }
    this.barChartData = {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        {
          data: vals,
          label: event.value,
        },
      ],
    };
  }

  public pieChartLegend = true;
  public pieChartPlugins = [];

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };
}
