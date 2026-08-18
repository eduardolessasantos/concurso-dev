export interface TopicExample {
  question: string;
  answer: string;
  aplication?: string;
  application?: string;
  code?: string;
  language?: string;
}

export interface UsefulLink {
  label: string;
  url: string;
  type: 'documentacao' | 'video' | 'estudo';
  /** ID do vídeo do YouTube. Extraído automaticamente da URL quando não informado. */
  youtubeId?: string;
}

export interface TopicDetail {
  title: string;
  slug?: string;
  aliases?: string[];
  peso?: string;
  summary: string;
  incidenciaFGV?: string;
  detail?: string;
  keyPoints: string[];
  tips: string[];
  examples?: TopicExample[];
  errosComuns?: string[];
  /** Links úteis curados para o tópico: documentação oficial, artigos e vídeos do YouTube. */
  usefulLinks?: UsefulLink[];
}
