export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};
