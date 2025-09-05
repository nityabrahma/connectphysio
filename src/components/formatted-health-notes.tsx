
"use client"

import { useRealtimeDb } from "@/hooks/use-realtime-db";
import type { Questionnaire } from "@/types/domain";

export const FormattedHealthNotes = ({ notes }: { notes?: string }) => {
  const [questionnaires] = useRealtimeDb<Record<string, Questionnaire>>('questionnaires', {});
  const [sessionQuestionnaires] = useRealtimeDb<Record<string, Questionnaire>>('sessionQuestionnaires', {});

  if (!notes) {
    return (
      <p className="text-sm text-muted-foreground">
        No health notes recorded for this session.
      </p>
    );
  }

  try {
    const parsed = JSON.parse(notes);

    // New format with distinct sections
    if (parsed.consultation || parsed.therapy || parsed.treatment || parsed.experiments || parsed.medicalConditions) {
      return (
        <div className="space-y-4 text-sm">
          {/* ... existing new format rendering ... */}
        </div>
      );
    }
    
    // Handle questionnaire format
    if (parsed.questionnaireId && parsed.answers) {
      const allForms = { ...questionnaires, ...sessionQuestionnaires };
      const formDef = allForms[parsed.questionnaireId];

      if (!formDef) {
        return <p className="text-sm text-muted-foreground">Could not load questionnaire structure.</p>;
      }

      return (
        <div className="space-y-2 text-sm">
          {parsed.answers.map((ans: { questionId: string, answer: any }) => {
            const question = formDef.questions.find(q => q.id === ans.questionId);
            if (!question) return null;

            return (
              <div key={ans.questionId}>
                <p className="font-semibold">{question.label}:</p>
                <p className="text-muted-foreground pl-2">{ans.answer?.toString() || "N/A"}</p>
              </div>
            );
          })}
        </div>
      );
    }

    throw new Error("Unknown notes format");
  } catch (e) {
    // Fallback for plain text notes
    return <p className="text-sm whitespace-pre-wrap">{notes}</p>;
  }
};
