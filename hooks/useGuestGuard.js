"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export default function useGuestGuard() {
  const [isGuest, setIsGuest] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsGuest(!!user?.is_anonymous);
    });
  }, []);

  const guardedAction = useCallback(
    (callback) => {
      return (...args) => {
        if (isGuest) {
          setShowModal(true);
          return;
        }
        return callback(...args);
      };
    },
    [isGuest]
  );

  return { isGuest, showModal, setShowModal, guardedAction };
}
