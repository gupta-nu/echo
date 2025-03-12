export const categories = {
    urgentImportant: { title: "Critical and Immediate", color: "bg-white border-gray-300" },
    notUrgentImportant: { title: "Important but not urgent", color: "bg-white border-gray-300" },
    urgentNotImportant: { title: "Critial and Shallow tasks", color: "bg-white border-gray-300" },
    notUrgentNotImportant: { title: "low Priority Tasks", color: "bg-white border-gray-300" },
  };
  
  export const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, '0');
    const end = String((i + 1) % 24).padStart(2, '0');
    const periodStart = i < 12 ? 'AM' : 'PM';
    const periodEnd = (i + 1) < 12 ? 'AM' : 'PM';
    const label = `${i % 12 === 0 ? 12 : i % 12}:00 ${periodStart} - ${(i + 1) % 12 === 0 ? 12 : (i + 1) % 12}:00 ${periodEnd}`;
    return { value: `${start}-${end}`, label };
  });