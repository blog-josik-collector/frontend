interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export const storeAuthSession = ({ accessToken, refreshToken }: AuthSession) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.removeItem('roles');
};

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('roles');
};
