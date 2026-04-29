"use client";

import { useEffect, useState } from "react";

export function useCredits() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.credits);
      }
      setLoading(false);
    };

    fetchBalance();
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/credits");
    if (res.ok) {
      const data = await res.json();
      setBalance(data.credits);
    }
  };

  return { balance, loading, refresh };
}
