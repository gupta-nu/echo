import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { mergeTimeSlots, formatTimeRange, generateDynamicSlots } from "../utils/helpers";

const TimeSlotModal = ({
  showTimeSlotForm,
  setShowTimeSlotForm,
  timeSlotsSelected,
  setTimeSlotsSelected,
  addTask
}) => {
  const [dynamicSlots, setDynamicSlots] = useState([]);

  useEffect(() => {
    const updateSlots = () => {
      const newSlots = generateDynamicSlots();
      setDynamicSlots(newSlots);
      // Preselect the first available slot if none selected
      if (!timeSlotsSelected.length && newSlots.length) {
        setTimeSlotsSelected([newSlots[0]]);
      }
    };

    updateSlots();
    const interval = setInterval(updateSlots, 1000 * 30); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTimeSlotChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTimeSlotsSelected(selectedOptions);
  };

  return (
    <AnimatePresence>
      {showTimeSlotForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
          onClick={() => setShowTimeSlotForm(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Select Time Slots</h2>
            {dynamicSlots.length > 0 ? (
              <>
                <select
                  multiple
                  value={timeSlotsSelected}
                  onChange={handleTimeSlotChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4 text-sm"
                  size="5"
                >
                  {dynamicSlots.map(slot => (
                    <option 
                      key={slot} 
                      value={slot}
                      className="text-sm p-1 hover:bg-blue-50 cursor-pointer"
                    >
                      {formatTimeRange(...slot.split('-').map(Number))}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-black mb-4">
                  Selected: {mergeTimeSlots(timeSlotsSelected)}
                </div>
              </>
            ) : (
              <div className="mb-4 text-sm text-gray-500">
                No more available time slots today
              </div>
            )}
            <button
              onClick={() => {
                addTask();
                setShowTimeSlotForm(false);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm"
            >
              {timeSlotsSelected.length > 0 ? "Add Task with Times" : "Add Task"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimeSlotModal;