import React, { useState } from "react";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { UserMessage } from "../services/usersApi";
import { capitalizeFirstLetter } from "../services/formatUtils";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<UserMessage>;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const handleSave = async () => {
    if (!tempValue.trim()) {
      setStatusMessage({ type: "error", text: `${label} cannot be empty.` });
      return;
    }
    try {
      const response = await onSave(tempValue);
      setStatusMessage({ type: "success", text: response.message });
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || `Failed to update ${label}.`;
      setStatusMessage({
        type: "error",
        text: capitalizeFirstLetter(errorMessage),
      });
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setStatusMessage({ type: null, text: "" });
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-grow p-2 rounded bg-gray-800 text-gray-100 border border-blue-400 focus:border-blue-600 focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="text-green-400 hover:text-green-500 transition duration-200"
            title="Save"
          >
            <FaCheck size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-400 hover:text-red-500 transition duration-200"
            title="Cancel"
          >
            <FaTimes size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-gray-100">{value || "N/A"}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-purple-400 hover:text-purple-500 transition duration-200"
            title="Edit"
          >
            <FaEdit size={18} />
          </button>
        </div>
      )}
      {statusMessage.type && (
        <p
          className={`text-sm mt-1 ${
            statusMessage.type === "success"
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
};

export default EditableField;
