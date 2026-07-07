export type Dictionary = {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    loading: string;
    error: string;
    success: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
  };
  nav: {
    dashboard: string;
    patients: string;
    schedule: string;
    soapNotes: string;
    exercises: string;
    assessments: string;
    messages: string;
    telehealth: string;
    billing: string;
    analytics: string;
    settings: string;
  };
  patient: {
    title: string;
    name: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    diagnosis: string;
    notes: string;
    newPatient: string;
  };
};
