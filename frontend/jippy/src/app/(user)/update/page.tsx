"use client";

import React from "react";
import "@/app/globals.css";
import UpdateUserForm from "@/features/user/components/UpdateUserForm";

const UpdatePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl m-6">회원 정보 수정</h1>
      <UpdateUserForm />
    </div>
  );
};

export default UpdatePage;
