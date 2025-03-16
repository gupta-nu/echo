// helpers.js
export const generateDynamicSlots = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Calculate next available slot (round up to nearest 30 minutes)
  const totalMinutes = currentHour * 60 + currentMinutes;
  const nextSlotMinutes = Math.ceil(totalMinutes / 30) * 30;
  const nextSlot = nextSlotMinutes / 60;

  const slots = [];
  let start = nextSlot;
  const END_HOUR = 23.5; // 11:30 PM

  while (start < END_HOUR) {
    const end = start + 0.5;
    slots.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    start = end;
  }
  
  return slots;
};

export const mergeTimeSlots = (slots) => {
  if (!slots.length) return '';
  const sorted = slots.map(slot => slot.split('-').map(Number))
                     .sort((a, b) => a[0] - b[0]);
  let merged = [];
  let [currentStart, currentEnd] = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [nextStart, nextEnd] = sorted[i];
    if (nextStart <= currentEnd) {
      currentEnd = Math.max(currentEnd, nextEnd);
    } else {
      merged.push([currentStart, currentEnd]);
      [currentStart, currentEnd] = [nextStart, nextEnd];
    }
  }
  merged.push([currentStart, currentEnd]);

  return merged.map(([s, e]) => formatTimeRange(s, e)).join(', ');
};

export const formatTimeRange = (start, end) => {
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = (time - hours) >= 0.5 ? 30 : 0;
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
};