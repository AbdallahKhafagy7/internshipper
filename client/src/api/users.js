import axios from "axios";
import api_url from "./config";

const API_URL = `${api_url}/users`;

export const getUsers = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserRole = async (userId, role, token) => {
  const response = await axios.patch(
    `${API_URL}/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};
