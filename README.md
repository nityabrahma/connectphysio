 paadd# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## TODO
- Add delete, assign package, and edit options and patient-details page.

# later
- remove grouping from patient appointment details from dashboard and make it according to time in ascending order.
- make calendar view for appointment schedules.
- make separate forms for reschedule and update session notes, update session notes in question format with some questions defined by admins with some predefined questions with slider and all. for pain intensity, etc.
- remove the patient from appointment's list and mark them completed with the session is updated
- At appointments form get patient automatically, and current time as default.
- Do not let add more dates than the session's start and end.
- active patients data at dashboard

## Future aspects

- Implement availability logic (prevent double booking).
- Generate summary of completed vs pending sessions.
- Daily session report for receptionist (how many patients checked in).
- Doctor/therapist report (sessions completed, pending notes).
- Package usage reports (active vs expired).

#### meeting notes

- package is used as a discount, not exact pricing
- A4 sheet paper, doctor's added details




Patient details page

- show all information on the patient history and option to update the details as well.
- Treatment block is different than the above section... this needs to maintain an audit trail of all the treatments provided to the patient.
- Treatment is shown on the left panel, Option to update the treatment. We will show 2 cards showing the treatment with date on when they are prescribed. Also show the latest one on top and older ones greayed out.
- Patient right side panel shows all the details of the patitient, followed by the next on today's session card..can be used to update the treamtment information if the session is checked-in.
- Add field to select the SEX of the patient. (demographic details)
- while ending a session, pick the current treatment plan of the patient and save it with the questionaire data.
- Data Section
    - Questionaire
        - consultation
        - therapy
    - Information
        - Treatment (with charges)
        - Experiments
        - medical conditions

=> on the right panel of the patient detail page
Patient data
    History -> for current problem
    Past Medical History -> any other issues that the patient has like diabitites, BP, etc
    Examination -> observations
Diagnosis
Treatment (left side bar)

- Add button to start a new treatment plan for the the existing patient. This adds a dropdown in the header for the doc to the select the treatment plan. The entire page details is changed one the drop down selection is changed.

## prescription
Letter Header space fixed in the code
---------
Patient Details
---------
Patitient data
---------
Diagnosis
---------
Treatment
---------


## billing
https://www.greenwoodpt.com/wp-content/uploads/2017/02/prescription-pad.png 

New bill
- select patient
- select session or manually add session treatment details
- auto fill treatment charges
- calculate total amount
- discount as per package if selected
- discount without package as well
- total amount 
- print
