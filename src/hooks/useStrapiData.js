import { useState, useEffect } from 'react';

export function useStrapiData(fetcher, args = {}, defaultValue = null) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  // Stringify arguments to ensure stable dependencies without requiring memoization from callers.
  const argsString = JSON.stringify(args);

  useEffect(() => {
    if (!fetcher) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    (async () => {
      setLoading(true);
      const parsedArgs = JSON.parse(argsString);
      try {
        const result = await fetcher({ ...parsedArgs, signal: controller.signal });
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetcher, argsString]);

  return { data, loading, setData };
}
