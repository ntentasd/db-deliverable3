import React from "react";
import { Helmet } from "react-helmet";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <Helmet>
        <title>DataDrive - Privacy Policy</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        At DataDrive, we are committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, and safeguard your information.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">Information We Collect</h2>
      <p>
        We collect personal information that you provide to us when you sign up
        for our services, such as your name, email address, and payment
        details.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">How We Use Your Information</h2>
      <p>
        Your information is used to provide and improve our services, process
        transactions, and communicate with you about updates and promotions.
      </p>
      <h2 className="text-xl font-bold mt-6 mb-2">Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at <a href="/contact" className="text-blue-500">Contact Us</a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
