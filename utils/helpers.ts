export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1;
  }
  return age;
};

export const getCategory = (age: number): string => {
  if (age < 18) return 'under18';
  if (age >= 60) return 'senior';
  return 'adult';
};

export const isVotingEligible = (age: number): boolean => {
  return age >= 18;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB');
};