// In a real app, use a robust library like nanoid or uuid.
// For this demo, a simple random string generator is sufficient.
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
