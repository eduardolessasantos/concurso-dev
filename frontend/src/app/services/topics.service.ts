import { Injectable } from '@angular/core';
import { TopicDetail } from '../models/topic-detail.model';
import { TOPICS_DATA } from './topics.data';

@Injectable({ providedIn: 'root' })
export class TopicsService {
  private normalizeKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  getTopicDetails(subjectId: string): TopicDetail[] {
    if (TOPICS_DATA[subjectId]) return TOPICS_DATA[subjectId];

    const normalizedSubjectId = this.normalizeKey(subjectId);
    const matchedKey = Object.keys(TOPICS_DATA).find(key => this.normalizeKey(key) === normalizedSubjectId);

    return matchedKey ? TOPICS_DATA[matchedKey] : [];
  }

  getTopicDetailByIndex(subjectId: string, index: number): TopicDetail | undefined {
    return this.getTopicDetails(subjectId)[index];
  }

  getTopicDetail(subjectId: string, topicName: string): TopicDetail | undefined {
    const details = this.getTopicDetails(subjectId);

    // Attempt exact match first
    const exact = details.find(d => d.title === topicName);
    if (exact) return exact;

    // Fuzzy match
    const normalize = (val: string) => val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const normalizedInput = normalize(topicName);

    return details.find(d => {
      if (normalize(d.title) === normalizedInput) return true;
      if (d.slug && normalize(d.slug) === normalizedInput) return true;
      return false;
    });
  }

  /**
   * Extrai o ID de um vídeo do YouTube a partir de sua URL.
   * Suporta formatos: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
   */
  extractYoutubeId(url: string): string | undefined {
    if (!url) return undefined;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : undefined;
  }
}
