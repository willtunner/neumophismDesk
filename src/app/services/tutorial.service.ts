import { inject, Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    CollectionReference,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Tutorial, Video } from '../models/models';

const PATH_TUTORIALS = 'tutorials';

@Injectable({
    providedIn: 'root',
})
export class TutorialService {
    private _firestore = inject(Firestore);
    private _sessionService = inject(SessionService);

    private get _tutorialsCollection(): CollectionReference {
        return collection(this._firestore, PATH_TUTORIALS);
    }

    /**
     * 💾 Cria ou atualiza um tutorial
     */
    async saveTutorial(tutorialData: Tutorial): Promise<Tutorial> {
        try {
            const currentUser = this._sessionService.getSession();
            if (!currentUser) throw new Error('Usuário não está logado');

            const now = new Date();

            // 🔹 Garantir que helpDeskCompanyId sempre será string
            const helpDeskCompanyId = tutorialData.helpDeskCompanyId || currentUser.helpDeskCompanyId;
            if (!helpDeskCompanyId) {
                throw new Error('helpDeskCompanyId não encontrado');
            }

            console.log('💾 Salvando tutorial:', {
                id: tutorialData.id,
                helpDeskCompanyId,
                title: tutorialData.dropdownTitle,
                videosCount: tutorialData.videos?.length
            });

            // 🟢 Novo tutorial
            if (!tutorialData.id) {
                const newTutorial: Omit<Tutorial, 'id'> = {
                    dropdownTitle: tutorialData.dropdownTitle,
                    videos: tutorialData.videos?.map(video => ({
                        ...video,
                        created: video.created || now,
                        id: video.id || this.generateId()
                    })) || [],
                    helpDeskCompanyId: helpDeskCompanyId, // ✅ Agora é garantidamente string
                };

                const docRef = await addDoc(this._tutorialsCollection, newTutorial);
                await updateDoc(docRef, { id: docRef.id });

                const createdTutorial: Tutorial = {
                    id: docRef.id,
                    ...newTutorial,
                };

                console.log('✅ Tutorial criado:', createdTutorial);
                return createdTutorial;
            }

            // 🟢 Atualização de tutorial existente
            const docRef = doc(this._tutorialsCollection, tutorialData.id);

            // 🔹 Criar payload com helpDeskCompanyId garantido como string
            const updatePayload = {
                dropdownTitle: tutorialData.dropdownTitle,
                videos: tutorialData.videos?.map(video => ({
                    ...video,
                    created: video.created || now
                })) || [],
                helpDeskCompanyId: helpDeskCompanyId, // ✅ Garantido como string
                updated: now
            };

            await updateDoc(docRef, updatePayload);

            // 🔹 Criar objeto Tutorial com tipos corretos
            const updatedTutorial: Tutorial = {
                id: tutorialData.id,
                dropdownTitle: updatePayload.dropdownTitle,
                videos: updatePayload.videos,
                helpDeskCompanyId: updatePayload.helpDeskCompanyId, // ✅ String garantida
            };

            console.log('✅ Tutorial atualizado:', updatedTutorial);
            return updatedTutorial;

        } catch (error) {
            console.error('❌ Erro ao salvar tutorial:', error);
            throw error;
        }
    }

    /**
     * 🔍 Busca todos os tutoriais por helpDeskCompanyId
     */
    async getAllTutorials(helpDeskCompanyId?: string): Promise<Tutorial[]> {
        try {
            const currentUser = this._sessionService.getSession();
            const actualHelpDeskId = helpDeskCompanyId || currentUser?.helpDeskCompanyId;

            if (!actualHelpDeskId) {
                console.error('❌ helpDeskCompanyId não fornecido');
                return [];
            }

            console.log('🔍 Buscando tutoriais para:', actualHelpDeskId);

            // Primeiro tenta com filtro
            try {
                const tutorialsQuery = query(
                    this._tutorialsCollection,
                    where('helpDeskCompanyId', '==', actualHelpDeskId)
                );

                const snapshot = await getDocs(tutorialsQuery);
                console.log(`📊 Encontrados ${snapshot.docs.length} documentos`);

                const tutorials = snapshot.docs.map((docSnap) => {
                    return this.mapFirestoreDataToTutorial(docSnap.id, docSnap.data());
                });

                console.log('✅ Tutoriais carregados:', tutorials);
                return tutorials;

            } catch (filterError) {
                console.warn('⚠️ Erro com filtro, buscando todos:', filterError);

                // Fallback: busca todos os documentos
                const snapshot = await getDocs(this._tutorialsCollection);
                const allTutorials = snapshot.docs.map((docSnap) => {
                    return this.mapFirestoreDataToTutorial(docSnap.id, docSnap.data());
                });

                // Filtra localmente por helpDeskCompanyId
                const filteredTutorials = allTutorials.filter(t =>
                    t.helpDeskCompanyId === actualHelpDeskId
                );

                console.log(`📊 ${filteredTutorials.length} tutoriais após filtro local`);
                return filteredTutorials;
            }

        } catch (error) {
            console.error('❌ Erro crítico ao buscar tutoriais:', error);
            return [];
        }
    }

    /**
     * 🔍 Busca um tutorial específico pelo ID
     */
    async getTutorialById(tutorialId: string): Promise<Tutorial | null> {
        try {
            const docRef = doc(this._tutorialsCollection, tutorialId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.warn('⚠️ Tutorial não encontrado:', tutorialId);
                return null;
            }

            return this.mapFirestoreDataToTutorial(docSnap.id, docSnap.data());
        } catch (error) {
            console.error('❌ Erro ao buscar tutorial:', error);
            return null;
        }
    }


    /**
     * 🗑️ Exclui um tutorial
     */
    async deleteTutorial(tutorialId: string): Promise<void> {
        try {
            const docRef = doc(this._tutorialsCollection, tutorialId);
            await deleteDoc(docRef);
            console.log('✅ Tutorial excluído:', tutorialId);
        } catch (error) {
            console.error('❌ Erro ao excluir tutorial:', error);
            throw error;
        }
    }

    /**
     * 🗺️ Converte dados do Firestore para o modelo Tutorial
     */
    private mapFirestoreDataToTutorial(id: string, data: any): Tutorial {
        console.log('🗺️ Mapeando documento:', id, data);

        let videos: Video[] = [];

        if (Array.isArray(data['videos'])) {
            videos = data['videos'].map((videoData: any) => ({
                id: videoData['id'] || this.generateId(),
                youtubeUrl: videoData['youtubeUrl'] || '',
                videoTitle: videoData['videoTitle'] || 'Sem título',
                sector: videoData['sector'] || 'Geral',
                created: videoData['created']?.toDate?.() || new Date(videoData['created'] || Date.now()),
            }));
        }

        // 🔹 Garantir que helpDeskCompanyId seja sempre string
        const helpDeskCompanyId = data['helpDeskCompanyId'] || 'unknown-company';

        const tutorial: Tutorial = {
            id,
            dropdownTitle: data['dropdownTitle'] || 'Sem título',
            videos: videos,
            helpDeskCompanyId: helpDeskCompanyId, // ✅ String garantida
        };

        console.log('✅ Tutorial mapeado:', tutorial);
        return tutorial;
    }

    /**
     * 🔧 Gera um ID único
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}