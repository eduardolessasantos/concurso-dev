export interface CourseResponseDto {
  id: string;
  professorId: string;
  professorName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  status: string;
  coverImageUrl?: string;
  createdAt: string;
  subjectsCount: number;
  enrollmentsCount: number;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  coverImageUrl?: string;
}

export interface CreateSubjectDto {
  courseId: string;
  name: string;
  description: string;
}

export interface CreateTopicDto {
  subjectId: string;
  title: string;
  examBoard: string;
}

export interface SubjectHierarchyDto {
  id: string;
  courseId: string;
  name: string;
  description: string;
  orderIndex: number;
  topics: TopicHierarchyDto[];
}

export interface TopicHierarchyDto {
  id: string;
  subjectId: string;
  title: string;
  examBoard: string;
  contentMarkdown?: string;
  orderIndex: number;
  flashcards?: {
    id?: string;
    topicId?: string;
    frontText: string;
    backText: string;
    difficulty?: string;
  }[];
  questions?: {
    id?: string;
    topicId?: string;
    statement: string;
    optionsJson?: string;
    options?: string[];
    correctOptionIndex: number;
    explanation?: string;
    examBoard?: string;
  }[];
}

export interface CourseStudyPlan {
  id: string;
  professorId: string;
  professorName?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  subjects: SubjectHierarchyDto[];
  studySchedules?: any[];
  simulatedTests?: any[];
}
