// Natural sort function for client names
export const naturalSort = (a: string, b: string): number => {
  // Helper function to extract number and suffix
  const parseClientName = (name: string): { num: number; suffix: string } => {
    const match = name.match(/^(\d+)([a-zA-Z]*)$/);
    if (match) {
      return {
        num: parseInt(match[1]),
        suffix: match[2].toLowerCase()
      };
    }
    return { num: 0, suffix: name.toLowerCase() };
  };

  // Parse both strings
  const aInfo = parseClientName(a.trim());
  const bInfo = parseClientName(b.trim());

  // If both have numbers, compare numbers first
  if (aInfo.num > 0 && bInfo.num > 0) {
    if (aInfo.num !== bInfo.num) {
      return aInfo.num - bInfo.num;
    }
    // If numbers are equal, compare suffixes
    return aInfo.suffix.localeCompare(bInfo.suffix);
  }

  // If only one has a number, prioritize it
  if (aInfo.num > 0) return -1;
  if (bInfo.num > 0) return 1;

  // Otherwise do a simple string comparison
  return aInfo.suffix.localeCompare(bInfo.suffix);
};