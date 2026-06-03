import { mockTags, mockPhotos, mockComentarios } from '../mockData';

export function initializeLocalData() {
  // Só inicializa se não houver dados
  if (!localStorage.getItem('tags')) {
    localStorage.setItem('tags', JSON.stringify(mockTags));
  }

  if (!localStorage.getItem('fotos')) {
    localStorage.setItem('fotos', JSON.stringify(mockPhotos));
  }

  if (!localStorage.getItem('comentarios')) {
    localStorage.setItem('comentarios', JSON.stringify(mockComentarios));
  }
}
