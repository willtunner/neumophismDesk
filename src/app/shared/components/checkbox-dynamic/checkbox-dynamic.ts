import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxConfig, CheckboxOption } from '../../../interfaces/checkbox-config.interface';
import { CheckboxLayout, CheckboxSelection } from '../../../enuns/checkbox-types.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkbox-dynamic.html',
  styleUrls: ['./checkbox-dynamic.css']
})
export class CheckboxDynamic implements OnInit {
  @Input() config!: CheckboxConfig;
  @Input() control!: FormControl;

  layout = CheckboxLayout;
  selection = CheckboxSelection;

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl([]);
    }
  }

  isChecked(option: CheckboxOption): boolean {
    if (this.config.selection === this.selection.SINGLE) {
      return this.control.value === option.value;
    }
    return Array.isArray(this.control.value) && this.control.value.includes(option.value);
  }

  toggleSelection(option: CheckboxOption): void {
    if (this.config.selection === this.selection.SINGLE) {
      this.control.setValue(option.value);
    } else {
      const current = Array.isArray(this.control.value) ? [...this.control.value] : [];
      const index = current.indexOf(option.value);
      if (index > -1) current.splice(index, 1);
      else current.push(option.value);
      this.control.setValue(current);
    }
    this.control.markAsDirty();
  }
}
