import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Firestore 
} from 'firebase/firestore';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: any;
  public db!: Firestore;

  constructor() {
    // Inicialize o Firebase apenas se tiver configuração
    if (environment.firebase && environment.firebase.apiKey) {
      this.app = initializeApp(environment.firebase);
      this.db = getFirestore(this.app);
      console.log('Firebase inicializado com sucesso');
    } else {
      console.warn('Configuração do Firebase não encontrada');
    }
  }

  // Verificar se Firebase está inicializado
  isInitialized(): boolean {
    return !!this.db;
  }

  // Método para obter dados de uma coleção
  async getCollection(collectionName: string): Promise<any[]> {
    if (!this.isInitialized()) {
      console.error('Firebase não inicializado');
      return [];
    }

    try {
      const querySnapshot = await getDocs(collection(this.db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  }

  // Adicionar documento
  async addDocument(collectionName: string, data: any): Promise<string | null> {
    if (!this.isInitialized()) {
      console.error('Firebase não inicializado');
      return null;
    }

    try {
      const docRef = await addDoc(collection(this.db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      return null;
    }
  }

  // Atualizar documento
  async updateDocument(collectionName: string, id: string, data: any): Promise<boolean> {
    if (!this.isInitialized()) {
      console.error('Firebase não inicializado');
      return false;
    }

    try {
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return false;
    }
  }

  // Deletar documento
  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    if (!this.isInitialized()) {
      console.error('Firebase não inicializado');
      return false;
    }

    try {
      const docRef = doc(this.db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      return false;
    }
  }
}
