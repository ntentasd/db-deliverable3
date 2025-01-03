import React, { useState } from "react";
import CarList from "../components/CarList";
import CarForm from "../components/CarForm";

const Cars: React.FC = () => {
  const [onInsert, setOnInsert] = useState<() => void>(() => {});

  return (
    <div className="space-y-8">
      <CarForm onInsert={onInsert} />
      <CarList setOnInsertHandler={(handler) => setOnInsert(() => handler)} />
    </div>
  );
};

export default Cars;
