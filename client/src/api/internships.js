import axios from "axios";
import api_url from "./config";

const API_URL = `${api_url}/internships`;

export const getInternships = async (filters = {}) => {
  const { search, industry, target, sort } = filters;
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (industry) params.set("industry", industry);
  if (target) params.set("target", target);
  if (sort) params.set("sort", sort);
  const qs = params.toString();

  const response = await axios.get(qs ? `${API_URL}?${qs}` : API_URL);
  return response.data;
};

export const getIndustries = async () => {
  const response = await axios.get(`${API_URL}/industries`);
  return response.data;
};

export const getInternshipById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createInternship = async (formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

export const deleteInternship = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

export const updateInternship = async (id, formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await axios.put(`${API_URL}/${id}`, formData, config);
  return response.data;
};
