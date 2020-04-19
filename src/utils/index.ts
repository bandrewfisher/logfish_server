export const isValidPhoneNumber = (phoneNumber: string): boolean => !!phoneNumber.match(/^\+[\d]{11}$/);
