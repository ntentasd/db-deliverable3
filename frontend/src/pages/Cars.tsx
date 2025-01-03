import React, { useState } from "react";
import CarList from "../components/CarList";
import CarForm from "../components/CarForm";
import { Helmet } from "react-helmet";

const Cars: React.FC = () => {
  const [onInsert, setOnInsert] = useState<() => void>(() => {});

  return (
    <div className="space-y-8">
      <Helmet>
        <title>DataDrive - Cars</title>
      </Helmet>
      <CarForm onInsert={onInsert} />
      <CarList setOnInsertHandler={(handler) => setOnInsert(() => handler)} />
    </div>
  );
};

export default Cars;
