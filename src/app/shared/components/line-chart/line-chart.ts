import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css'
})
export class LineChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  private chart?: Highcharts.Chart;
  private langChangeSub?: Subscription;
  private translateGetSub?: Subscription;
  showAll = true;

  constructor(private translate: TranslateService) {}

  ngAfterViewInit() {
    // Inicializa com traduções atuais
    this.loadTranslationsAndInitChart();

    // Atualiza quando o idioma muda
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadTranslationsAndInitChart(true); // updateOnly = true
    });

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    this.langChangeSub?.unsubscribe();
    this.translateGetSub?.unsubscribe();
    if (this.chart) this.chart.destroy();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    if (this.chart) setTimeout(() => this.chart?.reflow(), 100);
  }

  /** Gera cores aleatórias em hex */
  private generateRandomColors(count: number): string[] {
    return Array.from({ length: count }, () =>
      `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
    );
  }

  /** Gera dados entre 2 e 40 */
  private generateRandomMonthlyData(): number[] {
    return Array.from({ length: 12 }, () => Math.floor(2 + Math.random() * 38));
  }

  /** Carrega traduções e inicializa/atualiza gráfico */
  private loadTranslationsAndInitChart(updateOnly = false) {
    // Se já houver uma inscrição anterior, cancela para evitar memory leak
    this.translateGetSub?.unsubscribe();

    this.translateGetSub = this.translate
      .get([
        'CHART.TITLE_LINE_CHART',
        'CHART.SUBTITLE_LINE_CHART',
        'CHART.Y_AXIS_LINE_CHART',
        // fallback keys
        'CHART.TITLE',
        'CHART.SUBTITLE',
        'CHART.Y_AXIS'
      ])
      .subscribe((trans) => {
        const title = trans['CHART.TITLE_LINE_CHART'] || trans['CHART.TITLE'] || 'Chamados por mês';
        const subtitle = trans['CHART.SUBTITLE_LINE_CHART'] || trans['CHART.SUBTITLE'] || 'Evolução mensal de chamados';
        const yAxisLabel = trans['CHART.Y_AXIS_LINE_CHART'] || trans['CHART.Y_AXIS'] || 'Quantidade de chamados';

        const colors = this.generateRandomColors(5);

        if (updateOnly && this.chart) {
          // Atualiza títulos e cores dinamicamente
          this.chart.update(
            {
              title: { text: title },
              subtitle: { text: subtitle },
              yAxis: { title: { text: yAxisLabel } },
              colors: colors
            } as any,
            true,
            true
          );
        } else {
          // Cria o gráfico pela primeira vez
          this.initChart(title, subtitle, yAxisLabel, colors);
        }
      });
  }

  /** Inicializa o gráfico (com 'type' definido em cada série para satisfazer o TS) */
  private initChart(titleText: string, subtitleText: string, yAxisLabel: string, colors: string[]) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const options: Highcharts.Options = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
        spacing: [30, 20, 30, 20]
      },

      title: {
        text: titleText,
        align: 'center',
        style: { color: 'var(--text-primary)', fontWeight: '600', fontSize: '18px' },
        margin: 20
      },

      subtitle: {
        text: subtitleText,
        align: 'center',
        style: { color: 'var(--text-secondary)', fontSize: '14px' }
      },

      yAxis: {
        title: { text: yAxisLabel, style: { color: 'var(--text-primary)', fontSize: '12px' } },
        min: 0,
        gridLineColor: 'var(--shadow-light)',
        gridLineDashStyle: 'Dash',
        labels: { style: { color: 'var(--text-primary)', fontSize: '11px' } }
      },

      xAxis: {
        categories: months,
        labels: { style: { color: 'var(--text-primary)', fontSize: '11px' } }
      },

      // legend: {
      //   layout: 'vertical',
      //   align: 'right',
      //   verticalAlign: 'middle',
      //   itemStyle: { color: 'var(--text-primary)', fontSize: '12px' },
      //   itemHoverStyle: { color: 'var(--accent-color)' }
      // },

      legend: {
        layout: 'horizontal',         // muda de vertical para horizontal
        align: 'center',              // centraliza horizontalmente
        verticalAlign: 'bottom',      // posiciona embaixo do gráfico
        itemDistance: 15,
        symbolHeight: 10,
        symbolWidth: 10,
        symbolRadius: 5,
        itemStyle: {
          color: 'var(--text-primary)',
          fontSize: '12px',
          fontWeight: '500'
        },
        itemHoverStyle: { color: 'var(--accent-color)' },
        y: 15, // espaço extra para não colar nos meses
      },
      

      plotOptions: {
        series: {
          label: { connectorAllowed: false },
          marker: { enabled: true, radius: 3, symbol: 'circle' }
        },
        line: { lineWidth: 2 }
      },

      colors: colors,

      // Aqui está a correção importante: cada série recebe `type: 'line'`
      series: [
        { type: 'line', name: 'Dantop', data: this.generateRandomMonthlyData() },
        { type: 'line', name: 'Posto Km 23', data: this.generateRandomMonthlyData() },
        { type: 'line', name: 'Sarutaia', data: this.generateRandomMonthlyData() },
        { type: 'line', name: 'Posto Ipiranga', data: this.generateRandomMonthlyData() },
        { type: 'line', name: 'Posto Space', data: this.generateRandomMonthlyData() }
      ] as Highcharts.SeriesOptionsType[],

      credits: { enabled: false }
    };

    // Construir o chart
    this.chart = Highcharts.chart(this.chartContainer.nativeElement, options as any);
  }

  toggleAllSeries() {
    if (!this.chart) return;
    this.showAll = !this.showAll;

    this.chart.series.forEach((s) => {
      s.setVisible(this.showAll, false);
    });

    this.chart.redraw();
  }
}
