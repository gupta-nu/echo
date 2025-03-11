import {useState} from 'react';


const timeSlotpicker = ({selectedslots,onSelect}) => {
    const [isDragging, setIsDragging]= useState(false);

    //to gen 24hrs

    const hours= Array.from({length:24},(_,i)=>i);

    const handleMouseDown = (hour)=>
    {
        setIsDragging(true);
        toggleHour(hour);
    };

    const handleMouseEnter = (hour)=>
    
        {
            if(isDragging) toggleHour(hour);
        };
    

    const handleMouseUp= ()=>
    {
        setIsDragging(false);

    };

    const toggleHour =(hour)=>
    {
        const newSlots = selectedslots.includes(hour)
        ? selectedslots.filter(h=>h !==hour)
        : [...selectedslots,hour];
        onSelect([...new Set(newSlots)].sort((a,b)=> a-b));
    };

    const formatHour= (hour)=>
    {
        const period = hour >= 12 ? 'pm' :'am';
        const displayHour = hour % 12 || 12;
        return `${displayHour}${period}`;
    };


    return (
        <div
        className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
      >
        {hours.map(hour => (
        <button
          key={hour}
          className={`w-12 h-8 text-xs border rounded transition-colors ${
            selectedslots.includes(hour)
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-white border-gray-300 hover:bg-blue-100'
          }`}
          onMouseDown={() => handleMouseDown(hour)}
          onMouseEnter={() => handleMouseEnter(hour)}
        >
          {formatHour(hour)}
        </button>
      ))}
      </div>
    );
};
const TimeSlotPicker = () => {
    return <div>Select a time slot</div>;
  };
  
  export default TimeSlotPicker;
  