import { Injectable, signal } from '@angular/core';
import { Video, VideoCategory } from '../shared/components/video-dropdown/video-dropdown';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private categoriesSignal = signal<VideoCategory[]>([]);

  /** Retorna o signal das categorias (reativo) */
  get categories() {
    return this.categoriesSignal;
  }

  /** Inicializa com as categorias padrão */
  initialize(defaultCategories: VideoCategory[]) {
    if (this.categoriesSignal().length === 0) {
      this.categoriesSignal.set(defaultCategories);
    }
  }

  /** Adiciona uma nova categoria com vídeos */
  addCategory(newCategory: VideoCategory) {
    const updated = [...this.categoriesSignal(), newCategory];
    this.categoriesSignal.set(updated);
  }

  /** Adiciona um novo vídeo dentro de uma categoria existente ou cria nova se não existir */
  addVideoToCategoryByTitle(categoryTitle: string, newVideo: Video) {
    const current = this.categoriesSignal();
    const category = current.find(c => c.title.toLowerCase() === categoryTitle.toLowerCase());

    if (category) {
      // adiciona vídeo a categoria existente
      const updated = current.map(cat =>
        cat.title.toLowerCase() === categoryTitle.toLowerCase()
          ? { ...cat, videos: [...cat.videos, newVideo] }
          : cat
      );
      this.categoriesSignal.set(updated);
    } else {
      // cria nova categoria com o vídeo
      const newCategory: VideoCategory = {
        id: Date.now(),
        title: categoryTitle,
        videos: [newVideo]
      };
      this.addCategory(newCategory);
    }
  }

  /** Atualiza uma categoria existente */
  updateCategory(updatedCategory: VideoCategory) {
    const updated = this.categoriesSignal().map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    this.categoriesSignal.set(updated);
  }

  /** Remove uma categoria */
  removeCategory(categoryId: number) {
    const updated = this.categoriesSignal().filter(cat => cat.id !== categoryId);
    this.categoriesSignal.set(updated);
  }
}
