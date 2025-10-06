import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// Import dos módulos do Highcharts
import 'highcharts/modules/drilldown';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/accessibility';

@Component({
  selector: 'app-bar-chart-drilldown',
  imports: [CommonModule],
  templateUrl: './bar-chart-drilldown.html',
  styleUrl: './bar-chart-drilldown.css'
})
export class BarChartDrilldown implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  private chart: Highcharts.Chart | undefined;

  // Dados principais - Nível 1: TAGS
  private mainData = {
    "DFE": 4,
    "CONEXÃO": 8,
    "IMPRESSORA": 5,
    "OUT OF MEMORY": 18,
    "ENCERRANTES": 20,
    "LMC": 7,
    "DIFERENÇA DE CAIXA": 12,
    "DATA CAIXA": 9
  };

  // Dados de drilldown - Nível 2: POSTOS por TAG
  private drilldownData = {
    "DFE": [
      { name: 'Dantop', y: 2, drilldown: 'DFE-Dantop' },
      { name: 'Sarutaia', y: 1, drilldown: 'DFE-Sarutaia' },
      { name: 'KM 23', y: 1, drilldown: 'DFE-KM23' }
    ],
    "CONEXÃO": [
      { name: 'Dantop', y: 3, drilldown: 'CONEXÃO-Dantop' },
      { name: 'ESA', y: 2, drilldown: 'CONEXÃO-ESA' },
      { name: 'Posto Irati', y: 3, drilldown: 'CONEXÃO-PostoIrati' }
    ],
    "IMPRESSORA": [
      { name: 'Contrumaker', y: 2, drilldown: 'IMPRESSORA-Contrumaker' },
      { name: 'KM 23', y: 1, drilldown: 'IMPRESSORA-KM23' },
      { name: 'Dantop', y: 2, drilldown: 'IMPRESSORA-Dantop' }
    ],
    "OUT OF MEMORY": [
      { name: 'Dantop', y: 8, drilldown: 'OUTOFMEMORY-Dantop' },
      { name: 'ESA', y: 5, drilldown: 'OUTOFMEMORY-ESA' },
      { name: 'Posto Irati', y: 3, drilldown: 'OUTOFMEMORY-PostoIrati' },
      { name: 'KM 23', y: 2, drilldown: 'OUTOFMEMORY-KM23' }
    ],
    "ENCERRANTES": [
      { name: 'Dantop', y: 10, drilldown: 'ENCERRANTES-Dantop' },
      { name: 'ESA', y: 6, drilldown: 'ENCERRANTES-ESA' },
      { name: 'Contrumaker', y: 4, drilldown: 'ENCERRANTES-Contrumaker' }
    ],
    "LMC": [
      { name: 'Posto Irati', y: 3, drilldown: 'LMC-PostoIrati' },
      { name: 'Dantop', y: 2, drilldown: 'LMC-Dantop' },
      { name: 'ESA', y: 2, drilldown: 'LMC-ESA' }
    ],
    "DIFERENÇA DE CAIXA": [
      { name: 'Dantop', y: 5, drilldown: 'DIFERENÇADECAIXA-Dantop' },
      { name: 'KM 23', y: 4, drilldown: 'DIFERENÇADECAIXA-KM23' },
      { name: 'Contrumaker', y: 3, drilldown: 'DIFERENÇADECAIXA-Contrumaker' }
    ],
    "DATA CAIXA": [
      { name: 'ESA', y: 4, drilldown: 'DATACAIXA-ESA' },
      { name: 'Dantop', y: 3, drilldown: 'DATACAIXA-Dantop' },
      { name: 'Posto Irati', y: 2, drilldown: 'DATACAIXA-PostoIrati' }
    ]
  };

  // Dados de drilldown - Nível 3: DETALHES DO POSTO
  private postoDetailsData = {
    // DFE - Postos
    "DFE-Dantop": [
      ['Problema de Certificado', 1],
      ['Erro de Comunicação', 1]
    ],
    "DFE-Sarutaia": [
      ['Timeout de Comunicação', 1]
    ],
    "DFE-KM23": [
      ['Configuração Incorreta', 1]
    ],

    // CONEXÃO - Postos
    "CONEXÃO-Dantop": [
      ['Cabo de Rede', 2],
      ['Switch com Problema', 1]
    ],
    "CONEXÃO-ESA": [
      ['Wi-Fi Instável', 1],
      ['DNS não Responde', 1]
    ],
    "CONEXÃO-PostoIrati": [
      ['Problema no Roteador', 2],
      ['Conexão Lenta', 1]
    ],

    // IMPRESSORA - Postos
    "IMPRESSORA-Contrumaker": [
      ['Papel Encardido', 1],
      ['Cabeçote Sujo', 1]
    ],
    "IMPRESSORA-KM23": [
      ['Sem Papel', 1]
    ],
    "IMPRESSORA-Dantop": [
      ['Driver Corrompido', 1],
      ['Conexão USB', 1]
    ],

    // OUT OF MEMORY - Postos
    "OUTOFMEMORY-Dantop": [
      ['Memória RAM Insuficiente', 5],
      ['Cache Cheio', 3]
    ],
    "OUTOFMEMORY-ESA": [
      ['Vazamento de Memória', 3],
      ['Processos em Loop', 2]
    ],
    "OUTOFMEMORY-PostoIrati": [
      ['Banco de Dados Grande', 2],
      ['Logs Excessivos', 1]
    ],
    "OUTOFMEMORY-KM23": [
      ['Aplicação Consumindo Memória', 2]
    ],

    // ENCERRANTES - Postos
    "ENCERRANTES-Dantop": [
      ['Diferença no Fechamento', 6],
      ['Relatório não Gera', 4]
    ],
    "ENCERRANTES-ESA": [
      ['Dados Inconsistentes', 4],
      ['Backup Corrompido', 2]
    ],
    "ENCERRANTES-Contrumaker": [
      ['Configuração Incorreta', 3],
      ['Permissões Negadas', 1]
    ],

    // LMC - Postos
    "LMC-PostoIrati": [
      ['Sincronização Falha', 2],
      ['API Offline', 1]
    ],
    "LMC-Dantop": [
      ['Timeout na Comunicação', 1],
      ['Certificado Expirado', 1]
    ],
    "LMC-ESA": [
      ['Problema de Autenticação', 2]
    ],

    // DIFERENÇA DE CAIXA - Postos
    "DIFERENÇADECAIXA-Dantop": [
      ['Troco Incorreto', 3],
      ['Nota Fiscal não Emitida', 2]
    ],
    "DIFERENÇADECAIXA-KM23": [
      ['Pagamento em Duplicidade', 2],
      ['Cancelamento não Registrado', 2]
    ],
    "DIFERENÇADECAIXA-Contrumaker": [
      ['Fechamento Parcial', 2],
      ['Valor não Conferido', 1]
    ],

    // DATA CAIXA - Postos
    "DATACAIXA-ESA": [
      ['Data/Hora Incorreta', 3],
      ['Fuso Horário Errado', 1]
    ],
    "DATACAIXA-Dantop": [
      ['Sincronização NTP Falha', 2],
      ['BIOS com Problema', 1]
    ],
    "DATACAIXA-PostoIrati": [
      ['Servidor Horário Offline', 2]
    ]
  };

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
    // Preparar dados principais para o gráfico - Nível 1
    const seriesData = Object.entries(this.mainData).map(([name, y]) => ({
      name,
      y,
      drilldown: name
    }));

    // Preparar séries de drilldown - Nível 2
    const drilldownSeriesLevel2 = Object.entries(this.drilldownData).map(([id, data]) => ({
      name: id,
      id: id,
      data: data
    }));

    // Preparar séries de drilldown - Nível 3
    const drilldownSeriesLevel3 = Object.entries(this.postoDetailsData).map(([id, data]) => ({
      name: id.split('-')[1], // Nome do posto
      id: id,
      data: data
    }));

    this.chart = Highcharts.chart(this.chartContainer.nativeElement, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        reflow: true,
        spacing: [50, 20, 40, 20]
      },

      title: {
        text: 'Distribuição de Chamados por Categoria',
        align: 'center',
        style: {
          color: 'var(--text-primary)',
          fontWeight: '600',
          fontSize: '18px'
        },
        margin: 35
      },

      subtitle: {
        text: 'Clique nas barras para ver detalhes. Fonte: Sistema interno',
        align: 'center',
        style: {
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }
      },

      xAxis: {
        type: 'category',
        labels: {
          style: {
            color: 'var(--text-primary)',
            fontSize: '12px'
          }
        }
      },

      yAxis: {
        title: {
          text: 'Quantidade de Chamados',
          style: {
            color: 'var(--text-primary)'
          }
        },
        labels: {
          style: {
            color: 'var(--text-primary)'
          }
        },
        gridLineColor: 'var(--shadow-light)',
        gridLineWidth: 1
      },

      accessibility: {
        announceNewData: {
          enabled: true
        }
      },

      plotOptions: {
        column: {
          borderRadius: 6,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y}',
            style: {
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '11px',
              textOutline: 'none'
            }
          },
          cursor: 'pointer'
        }
      },

      tooltip: {
        headerFormat: '<span style="font-size:11px; color: var(--text-secondary)">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
          '<b>{point.y:.0f}</b> chamados',
        style: {
          color: 'var(--text-primary)'
        }
      },

      legend: {
        enabled: false
      },

      colors: [
        '#667eea', '#ffa726', '#66bb6a', '#42a5f5', '#ff6b6b',
        '#764ba2', '#ff9800', '#4caf50', '#2196f3', '#ff3b5c'
      ],

      series: [{
        name: 'Categorias',
        colorByPoint: true,
        data: seriesData
      }],

      drilldown: {
        activeDataLabelStyle: {
          color: 'var(--text-primary)',
          fontWeight: 'bold',
          textDecoration: 'none'
        },
        breadcrumbs: {
          showFullPath: true, // Mostra o caminho completo
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
              fontWeight: '500',
              fontSize: '12px'
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
        series: [...drilldownSeriesLevel2, ...drilldownSeriesLevel3]
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
            xAxis: {
              labels: {
                rotation: -30,
                style: {
                  fontSize: '10px'
                }
              }
            },
            plotOptions: {
              column: {
                dataLabels: {
                  style: {
                    fontSize: '10px'
                  }
                }
              }
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
            xAxis: {
              labels: {
                rotation: -45,
                style: {
                  fontSize: '9px'
                }
              }
            },
            plotOptions: {
              column: {
                dataLabels: {
                  style: {
                    fontSize: '9px'
                  }
                }
              }
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
            xAxis: {
              labels: {
                rotation: -45,
                style: {
                  fontSize: '8px'
                }
              }
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