import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { mergeTimeSlots, formatTimeRange, generateDynamicSlots } from "../utils/helpers";
import { Clock, X } from "lucide-react";

const TimeSlotModal = ({
  showTimeSlotForm,
  setShowTimeSlotForm,
  timeSlotsSelected,
  setTimeSlotsSelected,
  addTask,
  isDarkMode,
}) => {
  const [dynamicSlots, setDynamicSlots] = useState([]);

  useEffect(() => {
    const updateSlots = () => {
      const newSlots = generateDynamicSlots();
      setDynamicSlots(newSlots);
      if (!timeSlotsSelected.length && newSlots.length) {
        setTimeSlotsSelected([newSlots[0]]);
      }
    };

    updateSlots();
    const interval = setInterval(updateSlots, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleTimeSlotChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setTimeSlotsSelected(selectedOptions);
  };

  return (
    <AnimatePresence>
      {showTimeSlotForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowTimeSlotForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={`rounded-2xl p-6 w-96 max-w-[90vw] shadow-xl ${
              isDarkMode
                ? "bg-[rgb(44,44,46)] border border-[rgb(68,68,70)]"
                : "bg-white border border-[rgb(229,229,234)]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                <h2 className="text-base font-semibold">Select Time Slots</h2>
              </div>
              <button
                onClick={() => setShowTimeSlotForm(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-white/10 text-white/50" : "hover:bg-black/[0.04] text-black/30"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {dynamicSlots.length > 0 ? (
              <>
                <select
                  multiple
                  value={timeSlotsSelected}
                  onChange={handleTimeSlotChange}
                  className={`w-full p-2 rounded-xl mb-3 text-sm outline-none transition-colors ${
                    isDarkMode
                      ? "bg-[rgb(58,58,60)] border border-[rgb(72,72,74)] text-white"
                      : "bg-[rgb(242,242,247)] border border-[rgb(229,229,234)] text-[rgb(28,28,30)]"
                  }`}
                  size="5"
                >
                  {dynamicSlots.map((slot) => (
                    <option key={slot} value={slot} className="py-1">
                      {formatTimeRange(...slot.split("-").map(Number))}
                    </option>
                  ))}
                </select>
                <div className={`text-xs mb-4 ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                  Selected: {mergeTimeSlots(timeSlotsSelected) || "None"}
                </div>
              </>
            ) : (
              <div className={`mb-4 text-sm ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                No more available time slots today
              </div>
            )}

            <button
              onClick={() => {
                addTask();
                setShowTimeSlotForm(false);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
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
