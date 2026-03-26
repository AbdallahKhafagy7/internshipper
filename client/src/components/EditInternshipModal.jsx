import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateInternship, getIndustries } from "../api/internships";
import { Upload, X } from "lucide-react";
import Modal from "./Modal";
import SearchableSelect from "./SearchableSelect";

const EditInternshipModal = ({ isOpen, onClose, internship, token }) => {
  const queryClient = useQueryClient();
  const [editFormData, setEditFormData] = useState({
    title: internship.title || "",
    company: internship.company || "",
    industry: internship.industry || "Software",
    target: internship.target || "both",
    deadline: internship.deadline ? new Date(internship.deadline).toISOString().split("T")[0] : "",
    description: internship.description || "",
    applyContact: internship.applyContact || "",
    location: internship.location || "",
  });
  const [newImages, setNewImages] = useState([]);

  const { data: industryOptions = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: getIndustries,
  });

  const editMutation = useMutation({
    mutationFn: (data) => updateInternship(internship._id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["internships"]);
      queryClient.invalidateQueries(["internship", internship._id]);
      queryClient.invalidateQueries(["industries"]);
      onClose();
      setNewImages([]);
    },
  });

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (val) => {
    setEditFormData({ ...editFormData, industry: val });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", editFormData.title.trim());
    data.append("company", editFormData.company.trim());
    data.append("industry", editFormData.industry);
    data.append("applyContact", editFormData.applyContact.trim());
    data.append("description", editFormData.description.trim());
    data.append("deadline", editFormData.deadline);
    data.append("target", editFormData.target);
    data.append("location", editFormData.location.trim());

    newImages.forEach((image) => data.append("images", image));
    editMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Internship">
      <form
        onSubmit={handleEditSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={editFormData.title}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Company *
          </label>
          <input
            type="text"
            name="company"
            required
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={editFormData.company}
            onChange={handleEditChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            label="Industry *"
            value={editFormData.industry}
            options={industryOptions}
            onChange={handleIndustryChange}
            placeholder="Select or type industry..."
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={editFormData.deadline}
              onChange={handleEditChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Apply Link or Email *
          </label>
          <input
            type="text"
            name="applyContact"
            required
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={editFormData.applyContact}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={editFormData.location}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Target Audience
          </label>
          <div className="flex gap-4">
            {["undergrad", "freshgrad", "both"].map((t) => (
              <label
                key={t}
                className="flex items-center space-x-2 capitalize text-xs text-gray-600 dark:text-slate-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name="target"
                  value={t}
                  checked={editFormData.target === t}
                  onChange={handleEditChange}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={editFormData.description}
            onChange={handleEditChange}
          ></textarea>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">
            Add Images (max 5 total)
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center space-x-2 transition-colors">
              <Upload size={14} />
              <span>Upload</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <span className="text-[10px] text-gray-500 dark:text-slate-400">
              {newImages.length} new selected
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {newImages.map((img, i) => (
              <div key={i} className="relative w-12 h-12">
                <img
                  src={URL.createObjectURL(img)}
                  className="w-full h-full object-cover rounded"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={editMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-bold"
          >
            {editMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditInternshipModal;
