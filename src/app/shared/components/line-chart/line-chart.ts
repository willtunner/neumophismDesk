import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  imports: [CommonModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css'
})
export class LineChart implements AfterViewInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  private chart: Highcharts.Chart | undefined;

  ngAfterViewInit() {
    this.initChart();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    if (this.chart) {
      setTimeout(() => {
        this.chart?.reflow();
      }, 100);
    }
  }

  private initChart() {
    this.chart = Highcharts.chart(this.chartContainer.nativeElement, {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        reflow: true,
        spacing: [30, 20, 30, 20] // [top, right, bottom, left] - mais espaçamento
      },

      title: {
        text: 'U.S Solar Employment Growth',
        align: 'center', // Centralizado para mobile
        style: {
          color: 'var(--text-primary)',
          fontWeight: '600',
          fontSize: '18px'
        },
        margin: 20
      },

      subtitle: {
        text: 'By Job Category. Source: IREC.',
        align: 'center', // Centralizado para mobile
        style: {
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }
      },

      yAxis: {
        title: {
          text: 'Employees',
          style: {
            color: 'var(--text-primary)',
            fontSize: '12px'
          }
        },
        gridLineColor: 'var(--shadow-light)',
        gridLineDashStyle: 'Dash',
        labels: {
          style: {
            color: 'var(--text-primary)',
            fontSize: '11px'
          }
        }
      },

      xAxis: {
        accessibility: {
          rangeDescription: 'Range: 2010 to 2022'
        },
        labels: {
          style: {
            color: 'var(--text-primary)',
            fontSize: '11px'
          }
        }
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        itemStyle: {
          color: 'var(--text-primary)',
          fontSize: '12px'
        },
        itemHoverStyle: {
          color: 'var(--accent-color)'
        },
        itemMarginTop: 5,
        itemMarginBottom: 5
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointStart: 2010,
          marker: {
            enabled: true,
            radius: 3, // Menor para mobile
            symbol: 'circle'
          }
        },
        line: {
          lineWidth: 2 // Linha mais fina para mobile
        }
      },

      colors: [
        '#667eea', '#ffa726', '#66bb6a', '#42a5f5', '#ff6b6b'
      ],

      series: [{
        name: 'Installation',
        data: [
          43934, 48656, 65165, 81827, 112143, 142383,
          171533, 165174, 155157, 161454, 154610, 168960, 171558
        ]
      }, {
        name: 'Manufacturing',
        data: [
          24916, 37941, 29742, 29851, 32490, 30282,
          38121, 36885, 33726, 34243, 31050, 33099, 33473
        ]
      }, {
        name: 'Sales',
        data: [
          11744, 30000, 16005, 19771, 20185, 24377,
          32147, 30912, 29243, 29213, 25663, 28978, 30618
        ]
      }, {
        name: 'Operations',
        data: [
          null, null, null, null, null, null, null,
          null, 11164, 11218, 10077, 12530, 16585
        ]
      }, {
        name: 'Other',
        data: [
          21908, 5548, 8105, 11248, 8989, 11816, 18274,
          17300, 13053, 11906, 10073, 11471, 11648
        ]
      }],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 768
          },
          chartOptions: {
            chart: {
              spacing: [25, 15, 25, 15]
            },
            title: {
              align: 'center',
              style: {
                fontSize: '16px'
              },
              margin: 15
            },
            subtitle: {
              align: 'center',
              style: {
                fontSize: '12px'
              }
            },
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
              itemStyle: {
                fontSize: '11px'
              },
              padding: 10,
              margin: 10
            },
            plotOptions: {
              series: {
                marker: {
                  radius: 2
                }
              },
              line: {
                lineWidth: 2
              }
            }
          }
        }, {
          condition: {
            maxWidth: 480
          },
          chartOptions: {
            chart: {
              spacing: [20, 10, 20, 10],
              height: 450
            },
            title: {
              style: {
                fontSize: '15px'
              },
              margin: 10
            },
            legend: {
              itemStyle: {
                fontSize: '10px'
              },
              padding: 8,
              margin: 8,
              maxHeight: 100
            },
            yAxis: {
              title: {
                style: {
                  fontSize: '11px'
                }
              },
              labels: {
                style: {
                  fontSize: '10px'
                }
              }
            },
            xAxis: {
              labels: {
                style: {
                  fontSize: '10px'
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
              spacing: [15, 8, 15, 8],
              height: 480
            },
            title: {
              style: {
                fontSize: '14px'
              },
              margin: 8
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
              padding: 5,
              margin: 5,
              maxHeight: 80
            },
            series: [{
              name: 'Install'
            }, {
              name: 'Manufact'
            }, {
              name: 'Sales'
            }, {
              name: 'Operations'
            }, {
              name: 'Other'
            }]
          }
        }]
      },

      credits: {
        enabled: false
      }
    } as any);
  }
}
