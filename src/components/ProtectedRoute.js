import React from 'react';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, ...props }) => {
  return (
    props.loggedIn === true ? children : <Navigate to="/sign-up" />
)}

export default ProtectedRoute;