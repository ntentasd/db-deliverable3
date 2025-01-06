import React, { useState } from "react";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { capitalizeFirstLetter } from "../services/formatUtils";

interface EditableFieldProps {
  label?: string;
  value: string | boolean;
  type: "decimal" | "enum" | "boolean" | "text";
  enumOptions?: string[];
  onSave: (newValue: string | boolean) => Promise<{ message: string }>;
  validate: (newValue: string) => string | null;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, type, enumOptions = [], onSave, validate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string | boolean>(value);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const handleSave = async () => {
    const validationError = validate(tempValue.toString());
    if (validationError) {
      setStatusMessage({ type: "error", text: validationError });
      return;
    }

    try {
      const response = await onSave(type === "boolean" ? tempValue : tempValue.toString());
      setStatusMessage({ type: "success", text: response.message });
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || `Failed to update ${label}.`;
      setStatusMessage({ type: "error", text: capitalizeFirstLetter(errorMessage) });
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setStatusMessage({ type: null, text: "" });
  };

  const renderInputField = () => {
    if (type === "boolean") {
      const booleanValue = !!tempValue; // Ensure tempValue is boolean
      return (
        <div className="flex items-center">
          <label
            htmlFor={label}
            className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full ${
              booleanValue ? "bg-teal-500" : "bg-gray-500"
            }`}
          >
            <input
              type="checkbox"
              id={label}
              checked={booleanValue}
              onChange={(e) => setTempValue(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transform transition ${
                booleanValue ? "translate-x-6" : "translate-x-1"
              }`}
            ></span>
          </label>
        </div>
      );
    }

    if (type === "enum") {
      return (
        <select
          value={tempValue as string}
          onChange={(e) => setTempValue(e.target.value)}
          className="flex-grow p-2 rounded bg-gray-800 text-gray-100 border border-blue-400 focus:border-blue-600 focus:outline-none"
        >
          {enumOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={tempValue as string}
        onChange={(e) => setTempValue(e.target.value)}
        className="flex-grow p-2 rounded bg-gray-800 text-gray-100 border border-blue-400 focus:border-blue-600 focus:outline-none"
      />
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      {isEditing ? (
        <div className="flex items-center space-x-2">
          {renderInputField()}
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
        <div className="flex items-center justify-between">
          <p className="text-gray-100 flex-grow">
            {type === "boolean" ? (value ? "On" : "Off") : value || "N/A"}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-purple-400 hover:text-purple-500 transition duration-200 ml-4"
            title="Edit"
          >
            <FaEdit size={18} />
          </button>
        </div>
      )}
      {statusMessage.type && (
        <p
          className={`text-sm mt-1 ${
            statusMessage.type === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
};

export default EditableField;
