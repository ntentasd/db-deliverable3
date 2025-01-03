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
      const errorMessage = error.response?.data?.error ||
        `Failed to update ${label}.`;
      setStatusMessage({ type: "error", text: capitalizeFirstLetter(errorMessage) });
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setStatusMessage({ type: null, text: "" });
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-grow border p-2 rounded"
          />
          <button
            onClick={handleSave}
            className="text-green-500 hover:text-green-700"
          >
            <FaCheck />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-gray-600">{value || "N/A"}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
        </div>
      )}
      {statusMessage.type && (
        <p
          className={`text-sm ${
            statusMessage.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
};

export default EditableField;
