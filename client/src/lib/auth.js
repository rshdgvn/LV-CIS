export function isLoggedIn() {
  const token = localStorage.getItem("token");
  return !!token; 
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
