import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-button-dynamic',
  imports: [CommonModule],
  templateUrl: './button-dynamic.html',
  styleUrl: './button-dynamic.css'
})
export class ButtonDynamic {
  @Input() set iconSvg(value: string) {
    this._iconSvg = value;
    this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(value);
  }
  get iconSvg(): string {
    return this._iconSvg;
  }
  private _iconSvg: string = '';

  @Input() small: boolean = false;
  @Input() primary: boolean = false;
  @Input() aligned: boolean = true; // novo input para alinhamento
  @Input() disabled: boolean = false;
  @Input() ariaLabel: string = '';

  @Output() onClick = new EventEmitter<Event>();

  safeIconSvg: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
    this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml('');
  }
}
