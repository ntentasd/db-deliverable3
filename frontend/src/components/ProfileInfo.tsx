import React from "react";

interface ProfileInfoProps {
  label: string;
  value: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ label, value }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-gray-600">{value || "N/A"}</p>
    </div>
  );
};

export default ProfileInfo;
