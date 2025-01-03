import React from "react";
import { Helmet } from "react-helmet";

const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <Helmet>
        <title>DataDrive - Terms</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">
        These Terms of Service govern your use of the DataDrive website and
        services. By using our services, you agree to comply with these terms.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">Acceptance of Terms</h2>
      <p>
        By accessing or using our services, you agree to be bound by these
        terms. If you do not agree, please discontinue use of our services.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">Prohibited Activities</h2>
      <p>
        You may not use our services to engage in any unlawful activity,
        infringe on intellectual property rights, or harm others.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">Limitation of Liability</h2>
      <p>
        DataDrive is not liable for any damages arising from your use of our
        services beyond the amount you have paid to us.
      </p>
      <p className="mt-6">
        For further inquiries, please visit our <a href="/contact" className="text-blue-500">Contact Us</a> page.
      </p>
    </div>
  );
};

export default Terms;
