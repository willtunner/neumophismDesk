import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Document } from '../models/models';
import { NotificationService } from './notification';
import { NotificationTitle, NotificationType } from '../enuns/notification-icon-types.enum';

const PATH_DOCUMENTS = 'documents';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private notificationService = inject(NotificationService);

  // Signal para os documentos
  documents = signal<Document[]>([]);
  private userLogged = this._sessionService.getSession()!;

  constructor() {}

  // Getter para a coleção de documents
  private get _documentsCollection(): CollectionReference {
    return collection(this._firestore, PATH_DOCUMENTS);
  }

  // 🔹 Carregar todos os documentos do usuário
  async loadAllDocuments(): Promise<Document[]> {
    try {
      console.log('📝 Buscando documentos com helpDeskCompanyId:', this.userLogged.helpDeskCompanyId);

      if (!this.userLogged.helpDeskCompanyId) {
        console.log('❌ Usuário não possui helpDeskCompanyId');
        return [];
      }

      // Query para buscar documentos do usuário
      const documentsQuery = query(
        this._documentsCollection,
        where('helpDeskCompanyId', '==', this.userLogged.helpDeskCompanyId),
        where('userId', '==', this.userLogged.id),
        orderBy('created', 'desc')
      );

      const querySnapshot = await getDocs(documentsQuery);

      const documents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const document: Document = {
          id: doc.id,
          title: data['title'],
          content: data['content'],
          created: data['created']?.toDate() || new Date(),
          updated: data['updated']?.toDate() || undefined, // ✅ Corrigido: undefined em vez de null
          helpDeskCompanyId: data['helpDeskCompanyId'],
          userId: data['userId']
        };
        return document;
      });

      this.documents.set(documents);
      console.log('✅ Documentos encontrados:', documents.length);
      return documents;

    } catch (error) {
      console.error('❌ Erro ao buscar documentos:', error);
      return [];
    }
  }

  // 🔹 Salvar novo documento
  async saveDocument(documentData: Omit<Document, 'id' | 'created' | 'updated'>): Promise<Document> {
  try {
    console.log('💾 Salvando documento:', documentData.title);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      throw new Error('Usuário não está logado');
    }

    // ✅ Verificação adicional no service
    if (!currentUser.helpDeskCompanyId) {
      throw new Error('Usuário não possui helpDeskCompanyId');
    }

    const now = new Date();

    const newDocumentData = {
      ...documentData,
      helpDeskCompanyId: currentUser.helpDeskCompanyId,
      userId: currentUser.id,
      created: now
    };

    const docRef = await addDoc(this._documentsCollection, newDocumentData);

    const createdDocument: Document = {
      id: docRef.id,
      title: newDocumentData.title,
      content: newDocumentData.content,
      created: newDocumentData.created,
      helpDeskCompanyId: newDocumentData.helpDeskCompanyId, // ✅ Agora é garantidamente string
      userId: newDocumentData.userId
    };

    console.log('✅ Documento salvo com ID:', docRef.id);

    // Atualiza o signal
    this.documents.update(documents => [createdDocument, ...documents]);

    // Notificação
    this.notificationService.createNotification(
      NotificationTitle.CREATE_DOCUMENT,
      NotificationType.SUCCESS,
      `${createdDocument.title} criado com sucesso!`,
      false,
      `notes/${createdDocument.id}`,
    );

    return createdDocument;

  } catch (error) {
    console.error('❌ Erro ao salvar documento:', error);
    throw error;
  }
}

  // 🔹 Atualizar documento
  async updateDocument(documentId: string, documentData: Partial<Omit<Document, 'id' | 'created' | 'helpDeskCompanyId' | 'userId'>>): Promise<Document> {
    try {
      console.log('📝 Atualizando documento:', documentId);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const updateData = {
        ...documentData,
        updated: new Date()
      };

      const documentRef = doc(this._firestore, PATH_DOCUMENTS, documentId);
      await updateDoc(documentRef, updateData);

      const updatedDocument = await this.getDocumentById(documentId);

      if (!updatedDocument) {
        throw new Error('Documento não encontrado após atualização');
      }

      console.log('✅ Documento atualizado:', updatedDocument.title);

      // Atualiza o signal
      this.documents.update(documents =>
        documents.map(doc =>
          doc.id === documentId ? updatedDocument : doc
        )
      );

      // Notificação
      this.notificationService.createNotification(
        NotificationTitle.UPDATE_DOCUMENT,
        NotificationType.SUCCESS,
        `${updatedDocument.title} atualizado com sucesso!`,
        false,
        `/notes/${updatedDocument.id}`,
      );

      return updatedDocument;

    } catch (error) {
      console.error('❌ Erro ao atualizar documento:', error);
      throw error;
    }
  }

  // 🔹 Deletar documento
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo documento:', documentId);

      const documentRef = doc(this._firestore, PATH_DOCUMENTS, documentId);
      await deleteDoc(documentRef);

      console.log('✅ Documento excluído:', documentId);

      // Remove do signal
      this.documents.update(documents =>
        documents.filter(doc => doc.id !== documentId)
      );

      // Notificação
      this.notificationService.createNotification(
        NotificationTitle.DELETE_DOCUMENT,
        NotificationType.SUCCESS,
        `Documento excluído com sucesso`,
        false,
        null
      );

      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir documento:', error);
      return false;
    }
  }

  // 🔹 Buscar documento por ID
  async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const documentRef = doc(this._firestore, PATH_DOCUMENTS, documentId);
      const documentSnap = await getDoc(documentRef);

      if (documentSnap.exists()) {
        const data = documentSnap.data();
        const document: Document = {
          id: documentSnap.id,
          title: data['title'],
          content: data['content'],
          created: data['created']?.toDate() || new Date(),
          updated: data['updated']?.toDate() || undefined, // ✅ Corrigido: undefined em vez de null
          helpDeskCompanyId: data['helpDeskCompanyId'],
          userId: data['userId']
        };
        return document;
      }

      return null;

    } catch (error) {
      console.error('❌ Erro ao buscar documento por ID:', error);
      return null;
    }
  }

  // 🔹 Pesquisar documentos
  async searchDocuments(searchTerm: string): Promise<Document[]> {
    try {
      const allDocuments = await this.loadAllDocuments();
      
      if (!searchTerm.trim()) {
        return allDocuments;
      }

      const term = searchTerm.toLowerCase();
      return allDocuments.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.content.toLowerCase().includes(term)
      );

    } catch (error) {
      console.error('❌ Erro ao pesquisar documentos:', error);
      return [];
    }
  }
}