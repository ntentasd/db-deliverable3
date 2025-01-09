import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ModalProps {
  modalType: "service" | "damage";
  formData: {
    date: Date | null;
    description: string;
    cost: number;
    repaired?: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      date: Date | null;
      description: string;
      cost: number;
      repaired?: boolean;
    }>
  >;
  onAdd: () => void;
  onCancel: () => void;
}

const AddModal: React.FC<ModalProps> = ({ modalType, formData, setFormData, onAdd, onCancel }) => {
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    // Validation logic
    if (!formData.date) {
      setError("Please select a valid date.");
      return;
    }
    if (formData.cost <= 0) {
      setError("Cost must be greater than 0.");
      return;
    }
    if (modalType === "damage" && formData.repaired === undefined) {
      setError("Please specify whether the damage is repaired.");
      return;
    }

    setError(null);
    onAdd();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-teal-400 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add {modalType === "service" ? "Service" : "Damage"}</h2>

        {/* Display validation error */}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Date</label>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-none"
              placeholderText="Select a date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Cost ($)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.cost === 0 ? "" : formData.cost}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setFormData({ ...formData, cost: value === "" ? 0 : parseInt(value, 10) });
                }
              }}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-none"
              placeholder="Enter cost"
            />
          </div>
          {modalType === "damage" && (
            <div className="flex items-center space-x-2">
              <label className="text-gray-400">Repaired:</label>
              <input
                type="checkbox"
                checked={formData.repaired || false}
                onChange={(e) => setFormData({ ...formData, repaired: e.target.checked })}
                className="w-4 h-4"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handleAdd}
            className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition"
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
