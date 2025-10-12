import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ✅ No Highcharts 12+, basta importar — não é mais necessário chamar como função
import 'highcharts/modules/drilldown';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/accessibility';

@Component({
  selector: 'app-pie-chart',
  imports: [CommonModule],
  templateUrl: './pie-chart.html',
  styleUrl: './pie-chart.css'
})
export class PieChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  private chart?: Highcharts.Chart;
  private resizeHandler = this.handleResize.bind(this);

  ngAfterViewInit() {
    this.initChart();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    // ✅ Remove o mesmo listener
    window.removeEventListener('resize', this.resizeHandler);

    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private handleResize() {
    if (this.chart && this.chart.container) {
      // ✅ Verifica se o container ainda existe antes de reflow
      setTimeout(() => {
        if (this.chart?.container?.children?.length) {
          this.chart.reflow();
        }
      }, 100);
    }
  }

  private initChart() {
    this.chart = Highcharts.chart(this.chartContainer.nativeElement, {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        reflow: true,
        spacing: [50, 20, 40, 20] // Mais espaço no topo para breadcrumbs
      },

      title: {
        text: 'Distribuição de Chamados por Posto',
        align: 'center',
        style: {
          color: 'var(--text-primary)',
          fontWeight: '600',
          fontSize: '18px'
        },
        margin: 35
      },

      subtitle: {
        text: 'Clique nas fatias para ver detalhes. Fonte: Sistema interno',
        align: 'center',
        style: {
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }
      },

      accessibility: {
        announceNewData: {
          enabled: true
        },
        point: {
          valueSuffix: '' // Removido "%" do valor para melhor leitura
        }
      },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 8,
          dataLabels: [{
            enabled: true,
            distance: 20,
            format: '{point.name}',
            style: {
              color: 'var(--text-primary)',
              fontWeight: '500',
              fontSize: '12px',
              textOutline: 'none'
            }
          }, {
            enabled: true,
            distance: '-35%',
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4
            },
            format: '{point.y:.1f}%',
            style: {
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: '600',
              textOutline: 'none'
            }
          }],
          showInLegend: true
        }
      },

      tooltip: {
        headerFormat: '<span style="font-size:11px; color: var(--text-secondary)">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
          '<b>{point.y:.0f}</b> chamados<br/>' +
          '<b>({point.percentage:.1f}%)</b>',
        style: {
          color: 'var(--text-primary)'
        }
      },

      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
          color: 'var(--text-primary)',
          fontSize: '12px'
        },
        itemHoverStyle: {
          color: 'var(--accent-color)'
        },
        itemMarginTop: 5,
        itemMarginBottom: 5,
        padding: 10,
        margin: 15
      },

      colors: [
        '#667eea', '#ffa726', '#66bb6a', '#42a5f5', '#ff6b6b',
        '#764ba2', '#ff9800', '#4caf50', '#2196f3', '#ff3b5c'
      ],

      series: [{
        name: 'Browsers',
        colorByPoint: true,
        data: [{
          name: 'Dantop',
          y: 61,
          drilldown: 'Dantop'
        }, {
          name: 'Km 23',
          y: 9,
          drilldown: 'Km 23'
        }, {
          name: 'ESA',
          y: 10,
          drilldown: 'ESA'
        }, {
          name: 'Posto Irati',
          y: 8,
          drilldown: 'Posto Irati'
        }, {
          name: 'Contrumaker',
          y: 11,
          drilldown: 'Contrumaker'
        }]
      }],

      drilldown: {
        activeDataLabelStyle: {
          color: 'var(--text-primary)',
          fontWeight: 'bold',
          textDecoration: 'none'
        },
        breadcrumbs: {
          showFullPath: false,
          relativeTo: 'chart',
          position: {
            align: 'left',
            verticalAlign: 'top',
            x: 20,
            y: 20
          },
          buttonTheme: {
            fill: 'var(--bg-primary)',
            stroke: 'var(--shadow-light)',
            'stroke-width': 1,
            style: {
              color: 'var(--text-primary)',
              fontWeight: '500'
            },
            states: {
              hover: {
                fill: 'var(--accent-color)',
                style: {
                  color: 'white'
                }
              }
            }
          }
        },
        series: [{
          name: 'Dantop',
          id: 'Dantop',
          data: [
            ['NFCE', 36],
            ['NÃO IMPRIME', 18],
            ['DFE', 51],
            ['AUTOMAÇÃO', 7],
            ['NOTAS', 8],
            ['OUT OF MEMORY', 90],
            ['FECHAMENTO CAIXA', 150]
          ]
        }, {
          name: 'Km 23',
          id: 'Km 23',
          data: [
            ['NFCE', 36],
            ['NÃO IMPRIME', 18],
            ['DFE', 51],
            ['AUTOMAÇÃO', 7],
            ['NOTAS', 8],
            ['OUT OF MEMORY', 90],
            ['FECHAMENTO CAIXA', 150]
          ]
        }, {
          name: 'ESA',
          id: 'ESA',
          data: [
            ['NFCE', 36],
            ['NÃO IMPRIME', 18],
            ['DFE', 51],
            ['AUTOMAÇÃO', 7],
            ['NOTAS', 8],
            ['OUT OF MEMORY', 90],
            ['FECHAMENTO CAIXA', 150]
          ]
        }, {
          name: 'Posto Irati',
          id: 'Posto Irati',
          data: [
            ['NFCE', 36],
            ['NÃO IMPRIME', 18],
            ['DFE', 51],
            ['AUTOMAÇÃO', 7],
            ['NOTAS', 8],
            ['OUT OF MEMORY', 90],
            ['FECHAMENTO CAIXA', 150]
          ]
        }, {
          name: 'Contrumaker',
          id: 'Contrumaker',
          data: [
            ['NFCE', 25],
            ['NÃO IMPRIME', 12],
            ['DFE', 35],
            ['AUTOMAÇÃO', 5],
            ['NOTAS', 15],
            ['OUT OF MEMORY', 60],
            ['FECHAMENTO CAIXA', 80]
          ]
        }]
      },

      responsive: {
        rules: [{
          condition: {
            maxWidth: 768
          },
          chartOptions: {
            chart: {
              spacing: [45, 15, 35, 15]
            },
            title: {
              align: 'center',
              style: {
                fontSize: '16px'
              },
              margin: 25
            },
            subtitle: {
              align: 'center',
              style: {
                fontSize: '12px'
              }
            },
            plotOptions: {
              pie: {
                dataLabels: [{
                  distance: 15,
                  style: {
                    fontSize: '10px'
                  }
                }, {
                  distance: '-30%',
                  style: {
                    fontSize: '10px'
                  }
                }]
              }
            },
            legend: {
              itemStyle: {
                fontSize: '11px'
              },
              padding: 8,
              margin: 12
            },
            drilldown: {
              breadcrumbs: {
                position: {
                  x: 15,
                  y: 15
                }
              }
            }
          }
        }, {
          condition: {
            maxWidth: 480
          },
          chartOptions: {
            chart: {
              spacing: [40, 10, 30, 10],
              height: 450
            },
            title: {
              style: {
                fontSize: '15px'
              },
              margin: 20
            },
            plotOptions: {
              pie: {
                dataLabels: [{
                  enabled: true,
                  distance: 10,
                  style: {
                    fontSize: '9px'
                  }
                }, {
                  enabled: false
                }]
              }
            },
            legend: {
              itemStyle: {
                fontSize: '10px'
              },
              padding: 6,
              margin: 8,
              maxHeight: 100
            },
            drilldown: {
              breadcrumbs: {
                position: {
                  x: 10,
                  y: 10
                }
              }
            }
          }
        }, {
          condition: {
            maxWidth: 360
          },
          chartOptions: {
            chart: {
              spacing: [35, 8, 25, 8],
              height: 480
            },
            title: {
              style: {
                fontSize: '14px'
              },
              margin: 15
            },
            subtitle: {
              style: {
                fontSize: '11px'
              }
            },
            legend: {
              itemStyle: {
                fontSize: '9px'
              },
              padding: 4,
              margin: 6,
              maxHeight: 80
            },
            drilldown: {
              breadcrumbs: {
                position: {
                  x: 8,
                  y: 8
                }
              }
            }
          }
        }]
      },

      credits: {
        enabled: false
      }
    } as any);
  }
}
