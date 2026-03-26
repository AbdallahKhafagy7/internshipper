import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInternship } from "../api/internships"; // Your API helper

const InternshipForm = ({ initialData, onSuccess, token }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    company: initialData?.company || "",
    industry: initialData?.industry || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    applyContact: initialData?.applyContact || "",
    deadline: initialData?.deadline ? initialData.deadline.split("T")[0] : "",
  });

  const mutation = useMutation({
    mutationFn: (data) => updateInternship(initialData._id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["internships"]);
      onSuccess(); // Closes the modal
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Job Title
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Company
          </label>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            placeholder="e.g. Remote, NY"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? "Saving..." : "Update Internship"}
      </button>
    </form>
  );
};

export default InternshipForm;
