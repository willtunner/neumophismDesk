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
  showTable = false;
  private isDestroyed = false;

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
    this.isDestroyed = true;
    this.langChangeSub?.unsubscribe();
    this.translateGetSub?.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Remove tabela se existir
    this.removeDataTable();
  }

  private handleResize() {
    if (this.isDestroyed || !this.chart || !this.chartContainer?.nativeElement) {
      return;
    }

    if (!document.body.contains(this.chartContainer.nativeElement)) {
      return;
    }

    if (this.chart && typeof this.chart.reflow === 'function') {
      setTimeout(() => {
        if (!this.isDestroyed && this.chart && this.chartContainer?.nativeElement) {
          try {
            this.chart.reflow();
          } catch (error) {
            console.warn('Highcharts reflow error:', error);
            this.recreateChart();
          }
        }
      }, 100);
    }
  }

  private recreateChart() {
    if (this.isDestroyed || !this.chartContainer?.nativeElement) {
      return;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }
      
      this.loadTranslationsAndInitChart();
    } catch (error) {
      console.error('Error recreating chart:', error);
    }
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
    this.translateGetSub?.unsubscribe();

    this.translateGetSub = this.translate
      .get([
        'CHART.TITLE_LINE_CHART',
        'CHART.SUBTITLE_LINE_CHART',
        'CHART.Y_AXIS_LINE_CHART',
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
          this.initChart(title, subtitle, yAxisLabel, colors);
        }
      });
  }

  /** Inicializa o gráfico */
  private initChart(titleText: string, subtitleText: string, yAxisLabel: string, colors: string[]) {
    if (!this.chartContainer?.nativeElement || this.isDestroyed) {
      return;
    }
  
    try {
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
  
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
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
          y: 15,
        },
  
        plotOptions: {
          series: {
            label: { connectorAllowed: false },
            marker: { enabled: true, radius: 3, symbol: 'circle' }
          },
          line: { lineWidth: 2 }
        },
  
        colors: colors,
  
        series: [
          { type: 'line', name: 'Dantop', data: this.generateRandomMonthlyData() },
          { type: 'line', name: 'Posto Km 23', data: this.generateRandomMonthlyData() },
          { type: 'line', name: 'Sarutaia', data: this.generateRandomMonthlyData() },
          { type: 'line', name: 'Posto Ipiranga', data: this.generateRandomMonthlyData() },
          { type: 'line', name: 'Posto Space', data: this.generateRandomMonthlyData() }
        ] as Highcharts.SeriesOptionsType[],
  
        credits: { enabled: false }
      };
  
      this.chart = Highcharts.chart(this.chartContainer.nativeElement, options as any);
  
    } catch (error) {
      console.error('Error initializing Highcharts chart:', error);
    }
  }

  /** Mostra/oculta a tabela de dados */
  toggleDataTable() {
    this.showTable = !this.showTable;
    
    if (!this.chartContainer) return;
    
    const tableContainer = this.chartContainer.nativeElement.parentNode.querySelector('.neu-table-container');
    
    if (this.showTable) {
      if (!tableContainer) {
        this.createDataTable();
      } else {
        tableContainer.style.display = 'block';
      }
    } else {
      if (tableContainer) {
        tableContainer.style.display = 'none';
      }
    }
  }

  /** Remove a tabela de dados */
  private removeDataTable() {
    if (!this.chartContainer?.nativeElement) return;
    
    const tableContainer = this.chartContainer.nativeElement.parentNode.querySelector('.neu-table-container');
    if (tableContainer) {
      tableContainer.remove();
    }
  }

  /** Cria a tabela de dados estilizada */
  private createDataTable() {
    // Verificação de segurança adicionada aqui
    if (!this.chart || !this.chartContainer) return;

    setTimeout(() => {
      const chartContainer = this.chartContainer.nativeElement;
      
      // Verificação dupla de segurança
      if (!this.chart) return;
      
      // Remove tabela existente se houver
      this.removeDataTable();

      // Cria container para a tabela
      const tableContainer = document.createElement('div');
      tableContainer.className = 'neu-table-container';
      if (!this.showTable) {
        tableContainer.style.display = 'none';
      }
      
      // Adiciona título para a tabela
      const tableTitle = document.createElement('h3');
      tableTitle.textContent = 'Tabela de Dados - Chamados por Mês';
      tableTitle.className = 'table-title';
      tableContainer.appendChild(tableTitle);

      // Cria a tabela
      const table = document.createElement('table');
      table.className = 'neu-data-table';
      
      // Cria cabeçalho
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      // Célula para o mês
      const monthHeader = document.createElement('th');
      monthHeader.textContent = 'Mês';
      monthHeader.className = 'month-header';
      headerRow.appendChild(monthHeader);

      // Adiciona cabeçalhos das séries - COM VERIFICAÇÃO DE SEGURANÇA
      this.chart.series.forEach(series => {
        const th = document.createElement('th');
        th.textContent = series.name;
        th.className = 'series-header';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Cria corpo da tabela
      const tbody = document.createElement('tbody');
      
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      months.forEach((month, monthIndex) => {
        const row = document.createElement('tr');
        row.className = 'data-row';
        
        // Célula do mês
        const monthCell = document.createElement('td');
        monthCell.textContent = month;
        monthCell.className = 'month-cell';
        row.appendChild(monthCell);

        // Células de dados - COM VERIFICAÇÃO DE SEGURANÇA
        this.chart!.series.forEach(series => {
          const dataCell = document.createElement('td');
          const point = series.data[monthIndex];
          dataCell.textContent = point ? point.y?.toString() || '0' : '0';
          dataCell.className = 'data-cell';
          row.appendChild(dataCell);
        });
        
        tbody.appendChild(row);
      });

      // Adiciona linha de total - COM VERIFICAÇÃO DE SEGURANÇA
      const totalRow = document.createElement('tr');
      totalRow.className = 'total-row';
      
      const totalLabelCell = document.createElement('td');
      totalLabelCell.textContent = 'Total';
      totalLabelCell.className = 'total-label';
      totalRow.appendChild(totalLabelCell);

      this.chart.series.forEach(series => {
        const totalCell = document.createElement('td');
        const total = series.data.reduce((sum: number, point: any) => sum + (point.y || 0), 0);
        totalCell.textContent = total.toString();
        totalCell.className = 'total-cell';
        totalRow.appendChild(totalCell);
      });

      tbody.appendChild(totalRow);
      table.appendChild(tbody);
      tableContainer.appendChild(table);
      
      // Adiciona a tabela após o gráfico
      chartContainer.parentNode.insertBefore(tableContainer, chartContainer.nextSibling);

    }, 100);
  }

  toggleAllSeries() {
    // Verificação de segurança adicionada
    if (!this.chart || this.isDestroyed) return;
    
    try {
      this.showAll = !this.showAll;

      this.chart.series.forEach((s) => {
        s.setVisible(this.showAll, false);
      });

      this.chart.redraw();
      
      // Atualiza a tabela se estiver visível
      if (this.showTable) {
        this.removeDataTable();
        this.createDataTable();
      }
    } catch (error) {
      console.warn('Error toggling series:', error);
    }
  }

  /** Método auxiliar para verificar se o chart existe */
  private getChartSeries() {
    return this.chart ? this.chart.series : [];
  }
}