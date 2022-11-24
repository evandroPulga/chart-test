import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartData,
  ChartItem,
  LineElement,
  LineController,
  LinearScale,
  PointElement,
  ChartDataset,
  Filler,
} from 'chart.js';
import { datasets } from './mocks';

enum TimePeriods {
  month,
  day,
  hour,
}

const TimePeriodsPoints = [12, 24, 60];
const TimePeriodsPointsInterval = [
  60 * 60 * 24 * 30 * 1000,
  60 * 60 * 1000,
  60 * 10 * 1000,
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('chartCanvas') chartRef!: HTMLCanvasElement;

  private _data: ChartData = { labels: [], datasets };
  private _configuration!: ChartConfiguration;
  private _chart!: Chart;
  private _timePeriod: TimePeriods = TimePeriods.month;
  private _selected: { month: number; day: number } = { month: 0, day: 0 };

  ngOnInit(): void {
    this._configuration = {
      type: 'line',
      data: this._data,
      options: {
        onClick: (e: any, items: any[]) => this.canvasOnClick(e, items),
        responsive: true,
        scales: {
          y: {
            stacked: true,
          },
        },
        plugins: {
          filler: {
            propagate: false,
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
      },
    };
    this._generateData(new Date());

    const ctx = document.getElementById('chart-canvas');
    if (!ctx) return;

    Chart.register(CategoryScale);
    Chart.register(Filler);
    Chart.register(LineElement);
    Chart.register(LineController);
    Chart.register(LinearScale);
    Chart.register(PointElement);
    this._chart = new Chart(ctx as ChartItem, this._configuration);
  }

  reset() {
    this._selected.day = 0;
    this._selected.month = 0;
    this._timePeriod = TimePeriods.month;
    this._generateData(new Date());
    this._chart.update();
  }

  canvasOnClick(e: any, items: any[]) {
    if (!this._data.labels || this._timePeriod == TimePeriods.hour) return;

    const date = this._getDateOnClic(items[0].index);
    this._timePeriod = this._timePeriod + 1;

    this._generateData(date);
    this._chart.update();
  }

  private _getDateOnClic(labelIndex: number): Date {
    if (!this._data.labels) return new Date();
    if (this._timePeriod === TimePeriods.day) {
      const prefix = new Date();
      if (this._selected.month) prefix.setMonth(this._selected.month);
      if (this._selected.day) prefix.setDate(this._selected.day);
      const slice = (this._data.labels[labelIndex] as string).split(':', 1);
      prefix.setHours(+slice[0]);
      return prefix;
    }
    return new Date(this._data.labels[labelIndex] as string);
  }

  private _generateData(currentDate: Date) {
    this._selected.month = currentDate.getMonth();
    this._selected.day = currentDate.getDay();

    const labels: string[] = [];

    this._data.datasets.forEach((dataset) => (dataset.data = []));

    for (let index = TimePeriodsPoints[this._timePeriod]; index >= 0; index--) {
      const interval = TimePeriodsPointsInterval[this._timePeriod] * index;
      const date = new Date(currentDate.getTime() - interval);
      labels.push(
        this._timePeriod == TimePeriods.month
          ? date.toLocaleDateString()
          : date.toLocaleTimeString()
      );
      this._data.datasets.forEach((dataset) =>
        dataset.data.push(Math.random() * 100)
      );
    }
    this._data.labels = labels;
    this._configuration.data = this._data;
  }
}
