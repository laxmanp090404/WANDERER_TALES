import React, { useEffect, useRef } from "react";

const UploadWidget = ({ setCover }) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    // Ensure Cloudinary is loaded
    if (!window.cloudinary) {
      console.error("Cloudinary library is not loaded. Please include it in your project.");
      return;
    }

    // Ensure environment variables are properly configured
    const cloudName = process.env.REACT_APP_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error(
        "Missing Cloudinary configuration. Ensure REACT_APP_CLOUD_NAME and REACT_APP_CLOUD_PRESET are set."
      );
      return;
    }

    // Initialize the Cloudinary upload widget
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"], // Customize sources
        multiple: false, // Restrict to single file upload
        maxFileSize: 5000000, // 5MB limit
        resourceType: "image",
        cropping: true, // Allow cropping of the uploaded image
        croppingAspectRatio: 16 / 9, // Optional aspect ratio for cropping
        showUploadMoreButton: false,
        styles: {
          palette: {
            window: "#ffffff",
            sourceBg: "#f4f4f4",
            windowBorder: "#90a0b3",
            tabIcon: "#0078ff",
            inactiveTabIcon: "#69778a",
            menuIcons: "#0078ff",
            link: "#0078ff",
            action: "#0078ff",
            inProgress: "#0078ff",
            complete: "#33ff00",
            error: "#cc0000",
            textDark: "#000000",
            textLight: "#ffffff",
          },
        },
      },
      (error, result) => {
        if (error) {
          console.error("Upload Widget Error:", error.message || error);
          return;
        }

        if (result.event === "success") {
          console.log("Uploaded URL:", result.info.secure_url);
          setCover(result.info.secure_url); // Pass the URL to the parent component
        }
      }
    );
  }, [setCover]);

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error("Cloudinary widget is not initialized.");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={openWidget}
        className="montserrat p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Upload Image
      </button>
    </div>
  );
};

export default UploadWidget;
