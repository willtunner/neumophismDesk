import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusCards } from '../../shared/components/status-cards/status-cards';
import { LineChart } from '../../shared/components/line-chart/line-chart';
import { PieChart } from '../../shared/components/pie-chart/pie-chart';
import { TranslateModule } from '@ngx-translate/core';
import { BarChartDrilldown } from '../../shared/components/bar-chart-drilldown/bar-chart-drilldown';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    StatusCards,
    LineChart,
    PieChart,
    TranslateModule,
    BarChartDrilldown,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

 
}