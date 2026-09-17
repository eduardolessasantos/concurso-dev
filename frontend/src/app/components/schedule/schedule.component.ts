import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

const COMPLETED_WEEKS_KEY = 'dataprev_completed_weeks';

interface Phase {
  title: string;
  weeks: Week[];
}

interface Week {
  code: string;
  date: string;
  general: string;
  specific: string;
  completed: boolean;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NgClass],
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
  phases: Phase[] = [];
  completedWeeks: Record<string, boolean> = {};

  ngOnInit() {
    this.completedWeeks = JSON.parse(localStorage.getItem(COMPLETED_WEEKS_KEY) || '{}');
    this.buildSchedule();
  }

  buildSchedule() {
    const rawPhases = [
      ['FASE 1 · FUNDAÇÃO', 'S1 · 14–19 jul|Interpretação de texto; reading e skimming.|Ciclo de vida, ágeis, OO.|S2 · 21–26 jul|Concordância, regência e crase.|Java básico; coleções, streams; SQL.|S3 · 28 jul–02 ago|Lógica; fundamentos de IA.|Java OO; Spring Boot, JPA/Hibernate.|S4 · 04–09 ago|LGPD, Marco Civil e revisão dos gerais.|REST, HTTP, microsserviços, Docker e mensageria.'],
      ['FASE 2 · CONSOLIDAÇÃO', 'S5 · 11–16 ago|Coesão, coerência, semântica; 30 questões gerais.|Padrões de projeto; JUnit, Mockito e TDD.|S6 · 18–23 ago|Inglês técnico; LLMs, IA generativa e ética.|HTML, CSS, JavaScript; Angular/React.|S7 · 25–30 ago|Combinatória, probabilidade; ISO e Decreto 9.637.|CI/CD, Git; arquitetura hexagonal, Clean e DDD.|S8 · 01–06 set|Simulado parcial e revisão dos pontos fracos.|Correção e revisão focada nos erros.'],
      ['FASE 3 · INTENSIFICAÇÃO', 'S9 · 08–13 set|—|300+ questões: Java, Spring, REST e banco de dados.|S10 · 15–20 set|Simulado completo de 70 questões.|Correção minuciosa e mapa de erros.|S11 · 22–27 set|200+ questões gerais e provas FGV.|Revisão de legislação e atualidades.'],
      ['FASE 4 · RETA FINAL', 'S12 · 29 set–04 out|Simulado completo 2 e tiro curto.|Revisão de flashcards e temas mais cobrados.|S13 · 06–10 out|Revisão leve, flashcards e descanso cognitivo.|Organize documentos; descanso total na sexta.']
    ];

    this.phases = rawPhases.map(([title, weeksData]) => {
      const weeksStr = weeksData.split('|S').map((item, i) => i ? 'S' + item : item);
      const weeks: Week[] = weeksStr.map(item => {
        const [codeAndDate, general, specific] = item.split('|');
        const code = codeAndDate.split(' · ')[0];
        return {
          code,
          date: codeAndDate,
          general,
          specific,
          completed: !!this.completedWeeks[code]
        };
      });
      return { title, weeks };
    });
  }

  toggleWeek(week: Week) {
    week.completed = !week.completed;
    this.completedWeeks[week.code] = week.completed;
    localStorage.setItem(COMPLETED_WEEKS_KEY, JSON.stringify(this.completedWeeks));
  }
}
