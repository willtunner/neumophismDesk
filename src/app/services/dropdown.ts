import { Injectable, signal } from '@angular/core';
import { Tutorial, Video } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private categoriesSignal = signal<Tutorial[]>([]);

  /** Retorna o signal das categorias (reativo) */
  get categories() {
    return this.categoriesSignal;
  }

  /** Inicializa com as categorias padrão */
  initialize(defaultCategories: Tutorial[]) {
    if (this.categoriesSignal().length === 0) {
      this.categoriesSignal.set(defaultCategories);
    }
  }

  /** Adiciona uma nova categoria com vídeos */
  addCategory(newCategory: Tutorial) {
    const updated = [...this.categoriesSignal(), newCategory];
    this.categoriesSignal.set(updated);
  }

  /** Adiciona um novo vídeo dentro de uma categoria existente ou cria nova se não existir */
  addVideoToCategoryByTitle(categoryTitle: string, newVideo: Video) {
    const current = this.categoriesSignal();
    const category = current.find(c => c.dropdownTitle.toLowerCase() === categoryTitle.toLowerCase());

    if (category) {
      // adiciona vídeo a categoria existente
      const updated = current.map(cat =>
        cat.dropdownTitle.toLowerCase() === categoryTitle.toLowerCase()
          ? { ...cat, videos: [...cat.videos, newVideo] }
          : cat
      );
      this.categoriesSignal.set(updated);
    } else {
      // cria nova categoria com o vídeo
      const newCategory: Tutorial = {
        id: Date.now().toString(),
        dropdownTitle: categoryTitle,
        videos: [newVideo]
      };
      this.addCategory(newCategory);
    }
  }

  /** Atualiza uma categoria existente */
  updateCategory(updatedCategory: Tutorial) {
    const updated = this.categoriesSignal().map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    this.categoriesSignal.set(updated);
  }

  /** Remove uma categoria */
  removeCategory(categoryId: string) {
    const updated = this.categoriesSignal().filter(cat => cat.id !== categoryId);
    this.categoriesSignal.set(updated);
  }
}
