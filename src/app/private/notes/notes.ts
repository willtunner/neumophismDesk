import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { RichTextDynamicComponent } from '../../shared/components/rich-text-dynamic/rich-text-dynamic';
import { DocumentService } from '../../services/document-service';
import { SessionService } from '../../services/session.service';
import { Document } from '../../models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buildInputConfigs } from './util/notes-input-config.factory';
import { buildRichTextConfig } from './util/notes-richtext-config.factory';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputDynamicComponent,
    RichTextDynamicComponent
  ],
  templateUrl: './notes.html',
  styleUrl: './notes.scss'
})
export class Notes implements OnInit, OnDestroy {
  private documentService = inject(DocumentService);
  private sessionService = inject(SessionService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  
  private routeSub!: Subscription;
  private langSub!: Subscription;
  
  router = inject(Router);
  noteForm!: FormGroup;
  documents = signal<Document[]>([]);
  selectedDocument = signal<Document | null>(null);
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');

  inputConfigs: any = {};
  richTextConfig: any = {};

  ngOnInit(): void {
    this.initializeForm();
    this.initializeConfigs();
    this.setupRouteListener();
    this.loadDocuments();

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.initializeConfigs();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  private initializeForm(): void {
    this.noteForm = new FormGroup({
      title: new FormControl('', [Validators.minLength(3)]),
      content: new FormControl('', [Validators.minLength(10)])
    });
  }

  private initializeConfigs(): void {
    this.inputConfigs = buildInputConfigs(this.translate);
    this.richTextConfig = buildRichTextConfig(this.translate);
  }

  private setupRouteListener(): void {
    this.routeSub = this.route.paramMap.subscribe(async (params) => {
      const documentId = params.get('id');
      
      if (documentId) {
        await this.selectDocumentById(documentId);
      } else {
        this.clearFormAndSelection();
      }
    });
  }

  private async loadDocuments(): Promise<void> {
    this.isLoading.set(true);
    try {
      const docs = await this.documentService.loadAllDocuments();
      this.documents.set(docs);
    } catch (error) {
      console.error('❌ ' + this.translate.instant('NOTES.ERRORS.LOAD_ERROR'), error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async selectDocumentById(documentId: string): Promise<void> {
    try {
      const document = await this.documentService.getDocumentById(documentId);
      if (document) {
        this.setSelectedDocument(document);
      } else {
        this.clearSelection();
      }
    } catch (error) {
      console.error('❌ ' + this.translate.instant('NOTES.ERRORS.SELECT_ERROR'), error);
      this.clearSelection();
    }
  }

  private setSelectedDocument(document: Document): void {
    this.selectedDocument.set(document);
    this.isEditing.set(true);
    this.populateForm(document);
  }

  private clearSelection(): void {
    this.selectedDocument.set(null);
    this.isEditing.set(false);
  }

  private clearFormAndSelection(): void {
    this.noteForm.reset();
    this.clearSelection();
  }

  private populateForm(document: Document): void {
    this.noteForm.patchValue({
      title: document.title,
      content: document.content
    });
  }

  // Getters para os controles do formulário
  get titleControl(): FormControl {
    return this.noteForm.get('title') as FormControl;
  }

  get contentControl(): FormControl {
    return this.noteForm.get('content') as FormControl;
  }

  async onSubmit(): Promise<void> {
    if (this.noteForm.valid) {
      try {
        const formData = this.noteForm.value;
        const currentUser = this.sessionService.getSession()!;

        if (!currentUser.helpDeskCompanyId) {
          console.error('❌ Usuário não possui helpDeskCompanyId');
          return;
        }

        const documentData: Omit<Document, 'id' | 'created' | 'updated'> = {
          title: formData.title,
          content: formData.content,
          helpDeskCompanyId: currentUser.helpDeskCompanyId,
          userId: currentUser.id
        };

        let savedDocument: Document;

        if (this.isEditing() && this.selectedDocument()) {
          savedDocument = await this.documentService.updateDocument(
            this.selectedDocument()!.id,
            documentData
          );
        } else {
          savedDocument = await this.documentService.saveDocument(documentData);
        }

        await this.loadDocuments();
        this.router.navigate(['/notes', savedDocument.id]);

      } catch (error) {
        console.error('❌ ' + this.translate.instant('NOTES.ERRORS.SAVE_ERROR'), error);
      }
    } else {
      this.noteForm.markAllAsTouched();
    }
  }

  async onDelete(document: Document): Promise<void> {
    const confirmMessage = this.translate.instant('NOTES.ACTIONS.CONFIRM_DELETE', {
      title: document.title
    });

    if (confirm(confirmMessage)) {
      try {
        await this.documentService.deleteDocument(document.id);
        
        if (this.selectedDocument()?.id === document.id) {
          this.clearFormAndSelection();
          this.router.navigate(['/notes']);
        }
        
        await this.loadDocuments();
      } catch (error) {
        console.error('❌ ' + this.translate.instant('NOTES.ERRORS.DELETE_ERROR'), error);
      }
    }
  }

  onNewDocument(): void {
    this.clearFormAndSelection();
    this.router.navigate(['/notes']);
  }

  onSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  get filteredDocuments(): Document[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.documents();
    
    return this.documents().filter(doc =>
      doc.title.toLowerCase().includes(term) ||
      doc.content.toLowerCase().includes(term)
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(this.translate.currentLang, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método auxiliar para obter o texto do botão de submit
  getSubmitButtonText(): string {
    return this.isEditing() 
      ? this.translate.instant('NOTES.UPDATE_NOTE')
      : this.translate.instant('NOTES.SAVE_NOTE');
  }

  // Método auxiliar para obter o título do formulário
  getFormTitle(): string {
    return this.isEditing()
      ? this.translate.instant('NOTES.EDIT_NOTE')
      : this.translate.instant('NOTES.NEW_NOTE');
  }
}