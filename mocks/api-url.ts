// Match Axios baseURL joining, including relative prefixes and trailing slashes.
export const mockApiUrl = (path: string) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/';
  return `${baseURL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};
