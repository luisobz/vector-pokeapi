const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const inFlight = new Map<string, Promise<any>>();

export async function fetchApi<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const key = `${options?.method || "GET"}:${url}`;
    if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

    const promise = fetch(`${API_BASE_URL}${url}`, options)
        .then(async (res) => {
            if (!res.ok) {
                const errorBody = await res.text();
                throw new Error(errorBody || `HTTP ${res.status}`);
            }
            return res.json() as Promise<T>;
        })
        .finally(() => {
            inFlight.delete(key);
        });

    inFlight.set(key, promise);
    return promise;
}