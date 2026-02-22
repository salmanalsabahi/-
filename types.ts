
export interface UserProfile {
  name: string;
  age: number | null;
  lmp: string; // Last Menstrual Period date
  edd: string; // Expected Due Date
}

export interface Reminder {
  id: number;
  title: string;
  time: string;
}
