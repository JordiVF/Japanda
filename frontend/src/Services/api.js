const API_URL = 'http://localhost:5173';

export const getProductos = async () => {
  const response = await fetch(`${API_URL}/api/productos`);
  return await response.json();
};