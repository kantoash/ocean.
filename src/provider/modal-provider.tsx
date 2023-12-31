'use client'

import { useEffect, useState } from "react";
import { SettingWorkspace } from "../components/modal/setting-workspace";
import { TrashWorkspace } from "../components/modal/trash-workspace";
export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    if (!isMounted) {
      return null;
    }
  
    return (
      <>
      <SettingWorkspace/>
      <TrashWorkspace/>  
      </>
    )
  }