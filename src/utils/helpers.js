export const mergeTimeSlots = (slots) => {
    if (!slots.length) return '';
    const sorted = slots.map(slot => slot.split('-').map(Number)).sort((a, b) => a[0] - b[0]);
    let merged = [];
    let [start, end] = sorted[0];
  
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] === end) {
        end = sorted[i][1];
      } else {
        merged.push([start, end]);
        [start, end] = sorted[i];
      }
    }
    merged.push([start, end]);
  
    return merged.map(([s, e]) => formatTimeRange(s, e)).join(', ');
  };
  
  export const formatTimeRange = (start, end) => {
    const formatTime = (hour) => {
      const period = hour < 12 ? 'AM' : 'PM';
      return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${period}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };