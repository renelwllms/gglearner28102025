export const getAddressFromSchool = (school: any): string => {
  if (!school) return '';

  const parts = [];

  if (school['Street']) parts.push(school['Street']);
  if (school['Suburb']) parts.push(school['Suburb']);
  if (school['City']) parts.push(school['City']);
  if (school['DHB']) parts.push(school['DHB']);

  return parts.join(', ');
};
