"use client";

import { ToastContainer } from "react-toastify";

export default function Toastify() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
      className="poh-toast-container"
      toastClassName="poh-toast"
      bodyClassName="poh-toast-body"
    />
  );
}
