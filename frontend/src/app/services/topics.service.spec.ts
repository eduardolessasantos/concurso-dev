import { describe, expect, it } from 'vitest';
import { SubjectsService } from './subjects.service';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
  it('should resolve topic details for the architecture subject id via normalized key lookup', () => {
    const service = new TopicsService();

    expect(service.getTopicDetails('arquitetura-software').length).toBeGreaterThan(0);
    expect(service.getTopicDetailByIndex('arquitetura-software', 0)).toBeDefined();
  });

  it('should resolve a topic detail by the exact subject topic label used in the UI', () => {
    const service = new TopicsService();
    const subjectsService = new SubjectsService();
    const subject = subjectsService.getById('arquitetura-software');

    expect(subject?.topics[0]).toBeDefined();
    expect(service.getTopicDetail(subject!.id, subject!.topics[0])?.title).toBeDefined();
  });

  it('should resolve the missing architecture topic label without falling to the next indexed entry', () => {
    const service = new TopicsService();

    const detail = service.getTopicDetail('arquitetura-software', 'Orientação a objetos e arquitetura web');

    expect(detail?.title).toBe('Orientação a objetos e arquitetura web');
  });
});
