import { motion } from "framer-motion";

const NotepadModal = ({ showNotepad, setShowNotepad, notes, setNotes }) => {
  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ transformPerspective: 1000 }}
      className="fixed w-96 h-[28rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10"
    >
<div className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">Quick Notes</span>
              <button
                onClick={() => setShowNotepad(false)}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                ❌
              </button>
            </div>
            <textarea
              className="flex-1 p-2 text-xs resize-none focus:outline-none bg-gray-50 rounded-b-lg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your thoughts here..."
              autoFocus
            />    </motion.div>
  );
};

export default NotepadModal;