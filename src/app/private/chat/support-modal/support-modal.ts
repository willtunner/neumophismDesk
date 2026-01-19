import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { 
  MatDialogRef, 
  MAT_DIALOG_DATA, 
  MatDialogModule 
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SelectDynamicComponent } from '../../../shared/components/select-dynamic/select-dynamic';
import { SelectConfig } from '../../../interfaces/select-config.interface';

// export interface SupportModalData {
//   clientData: {
//     nome: string;
//     empresa: string;
//     cnpj: string;
//     status: boolean;
//     foto: string;
//   };
// }

export interface SupportSelection {
  assunto: string;
  horario: string;
}

@Component({
  selector: 'app-support-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule,
    MatButtonModule,
    SelectDynamicComponent
  ],
  templateUrl: './support-modal.html',
  styleUrls: ['./support-modal.scss']
})
export class SupportModalComponent {
  supportControl = new FormControl('', [Validators.required]);

  supportOptionsConfig: SelectConfig = {
    formControlName: 'assunto',
    label: 'Assunto',
    placeholder: 'Escolha um assunto',
    required: true,
    options: [
      { value: '', label: 'Escolha um assunto', disabled: false },
      { value: 'nfc', label: 'NFC', disabled: false },
      { value: 'nfe', label: 'NFE', disabled: false },
      { value: 'dfe', label: 'DFE', disabled: false },
      { value: 'email', label: 'EMAIL', disabled: false },
      { value: 'diferenca-lmc', label: 'DIFERENÇA LMC', disabled: false },
      { value: 'impressora', label: 'IMPRESSORA', disabled: false },
      { value: 'abastecimentos', label: 'ABASTECIMENTOS', disabled: false },
      { value: 'diferenca-caixa', label: 'DIFERENÇA CAIXA', disabled: false },
      { value: 'automacao', label: 'AUTOMAÇÃO', disabled: false },
      { value: 'financeiro', label: 'FINANCEIRO', disabled: false }
    ]
  };

  constructor(
    public dialogRef: MatDialogRef<SupportModalComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: SupportModalData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveSelection(): void {
    if (this.supportControl.valid) {
      const selectedOption = this.supportOptionsConfig.options.find(
        option => option.value === this.supportControl.value
      );

      const supportData: SupportSelection = {
        assunto: selectedOption?.label || this.supportControl.value!,
        horario: new Date().toLocaleString('pt-BR')
      };

      // Print no console conforme solicitado
      console.log('Dados do suporte selecionado:', supportData);

      // Fecha a modal e retorna os dados
      this.dialogRef.close(supportData);
    } else {
      this.supportControl.markAsTouched();
    }
  }
}