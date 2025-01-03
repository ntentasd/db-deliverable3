import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-6">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} DataDrive. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <a
            href="/privacy-policy"
            className="text-gray-300 hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-gray-300 hover:text-white"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-gray-300 hover:text-white"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;