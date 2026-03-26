import axios from "axios";
import api_url from "./config";

const API_URL = `${api_url}/applications`;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const applyForInternship = async (internshipId, token) => {
  const response = await axios.post(
    API_URL,
    { internshipId },
    getHeaders(token),
  );
  return response.data;
};

export const getMyApplications = async (token) => {
  const response = await axios.get(`${API_URL}/my`, getHeaders(token));
  return response.data;
};

export const updateApplicationStatus = async ({ id, status, token }) => {
  const response = await axios.patch(
    `${API_URL}/${id}/status`,
    { status },
    getHeaders(token),
  );
  return response.data;
};

export const untrackApplication = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders(token));
  return response.data;
};
