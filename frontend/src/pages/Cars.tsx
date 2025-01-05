import React, { useState } from "react";
import CarList from "../components/CarList";
import CarForm from "../components/CarForm";
import { Helmet } from "react-helmet";

const Cars: React.FC = () => {
  const [onInsert, setOnInsert] = useState<() => void>(() => {});

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-6">
      <Helmet>
        <title>DataDrive - Cars</title>
      </Helmet>
      <h2 className="text-3xl font-bold text-teal-400 text-center">Manage Cars</h2>
      <CarForm onInsert={onInsert} />
      <CarList setOnInsertHandler={(handler) => setOnInsert(() => handler)} />
    </div>
  );
};

export default Cars;
