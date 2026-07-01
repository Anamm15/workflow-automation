export const isSameDate = (d1: Date, d2: Date) => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export const isToday = (d: Date) => isSameDate(d, new Date());

export function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayObj = new Date(year, month, 1);
  const startDay = firstDayObj.getDay();

  const res = [];
  for (let i = 0; i < startDay; i++) res.push(null);
  for (let i = 1; i <= daysInMonth; i++) res.push(new Date(year, month, i));
  return res;
}
