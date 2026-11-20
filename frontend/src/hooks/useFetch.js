import { useEffect, useState } from "react";
import { api } from "../services/api";

// Loads data from the API whenever `path` changes.
// Returns { data, setData, loading, error, reload }.
export default function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false; // ignore the response if the page changed while waiting
    setLoading(true);
    setError("");
    api(path)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, reloadCount]);

  return { data, setData, loading, error, reload: () => setReloadCount((n) => n + 1) };
}
