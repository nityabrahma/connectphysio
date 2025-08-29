
"use client"

export const FormattedHealthNotes = ({ notes }: { notes?: string }) => {
  if (!notes) {
    return (
      <p className="text-sm text-muted-foreground">
        No health notes recorded for this session.
      </p>
    );
  }

  try {
    const parsed = JSON.parse(notes);

    // New format check
    if (parsed.consultation || parsed.therapy || parsed.treatment) {
      return (
        <div className="space-y-4 text-sm">
          {parsed.consultation && (
            <div>
              <h5 className="font-semibold">Consultation</h5>
              <p className="text-muted-foreground whitespace-pre-wrap">{parsed.consultation}</p>
            </div>
          )}
          {parsed.therapy && (
            <div>
              <h5 className="font-semibold">Therapy</h5>
              <p className="text-muted-foreground whitespace-pre-wrap">{parsed.therapy}</p>
            </div>
          )}
          {parsed.treatment && (
            <div>
              <h5 className="font-semibold">Treatment</h5>
              <p className="text-muted-foreground">{parsed.treatment.description} (Charges: ₹{parsed.treatment.charges})</p>
            </div>
          )}
          {parsed.experiments && (
            <div>
              <h5 className="font-semibold">Experiments</h5>
              <p className="text-muted-foreground whitespace-pre-wrap">{parsed.experiments}</p>
            </div>
          )}
          {parsed.medicalConditions && (
            <div>
              <h5 className="font-semibold">Medical Conditions</h5>
              <p className="text-muted-foreground whitespace-pre-wrap">{parsed.medicalConditions}</p>
            </div>
          )}
        </div>
      );
    }
    
    // Fallback for old questionnaire format
     if (parsed.questionnaireId && parsed.answers) {
      return <p className="bg-secondary/50 p-3 rounded-md text-sm">Legacy consultation questions data is not displayable.</p>;
    }

    throw new Error("Unknown notes format");
  } catch (e) {
    // Fallback for plain text notes
    return <p className="bg-secondary/50 p-3 rounded-md text-sm whitespace-pre-wrap">{notes}</p>;
  }
};
