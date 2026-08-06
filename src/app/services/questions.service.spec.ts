import { describe, expect, it } from 'vitest';
import { QuestionsService } from './questions.service';
import { SubjectsService } from './subjects.service';

describe('QuestionsService', () => {
  it('should provide questions for every subject range declared in the catalog', () => {
    const questionsService = new QuestionsService();
    const subjectsService = new SubjectsService();

    for (const subject of subjectsService.getAll()) {
      const rangeQuestions = questionsService.getBySubjectRange(subject.range[0], subject.range[1]);
      expect(rangeQuestions.length).toBe(subject.range[1] - subject.range[0] + 1);
    }
  });
});
