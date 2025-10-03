export function formatMessageTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };

  if (isToday) {
    return date.toLocaleTimeString([], timeOptions);
  }

  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], timeOptions)}`;
  }

  const dateOptions = { month: "short", day: "numeric" };
  return `${date.toLocaleDateString([], dateOptions)}, ${date.toLocaleTimeString([], timeOptions)}`;
}
