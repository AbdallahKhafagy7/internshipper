import { useState, useContext } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createInternship, getIndustries } from "../api/internships";
import { AuthContext } from "../context/AuthContext";
import { Upload, X } from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";

const PostInternship = () => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    industry: "",
    target: "both",
    deadline: "",
    description: "",
    applyContact: "",
    location: "",
  });

  const [images, setImages] = useState([]);

  const { data: industryOptions = [] } = useQuery({
    queryKey: ["industries"],
    queryFn: getIndustries,
  });

  const mutation = useMutation({
    mutationFn: (data) => createInternship(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["internships"]);
      queryClient.invalidateQueries(["industries"]);
      navigate("/");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (val) => {
    setFormData({ ...formData, industry: val });
  };

  // FIXED: Corrected function declaration
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Enforcement of the "Max 5" rule
    if (images.length + files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("company", formData.company.trim());
    data.append("industry", formData.industry);
    data.append("applyContact", formData.applyContact.trim());
    data.append("description", formData.description.trim());

    if (formData.deadline) {
      data.append("deadline", formData.deadline);
    }
    if (formData.target) {
      data.append("target", formData.target);
    }
    if (formData.location.trim()) {
      data.append("location", formData.location.trim());
    }

    images.forEach((image) => data.append("images", image));
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Post New Internship
      </h2>

      {mutation.isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 text-sm">
            {mutation.error?.response?.data?.message ||
              "Could not post internship."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* Company */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            required
            placeholder="Organization offering the internship"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        {/* Industry & Deadline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableSelect
            label="Industry *"
            value={formData.industry}
            options={industryOptions}
            onChange={handleIndustryChange}
            placeholder="Select or type industry..."
          />
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
              Deadline{" "}
              <span className="text-gray-400 dark:text-gray-500 text-sm italic font-normal">
                (Optional)
              </span>
            </label>
            <input
              type="date"
              name="deadline"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Apply Contact */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Apply link or email <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="applyContact"
            required
            placeholder="https://careers.example.com/apply or hiring@company.com"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            value={formData.applyContact}
            onChange={handleChange}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Where candidates should apply.
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Location{" "}
            <span className="text-gray-400 dark:text-gray-500 text-sm italic font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            name="location"
            placeholder="City, country or Remote"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Target audience{" "}
            <span className="text-gray-400 dark:text-gray-500 text-sm italic font-normal">
              (Optional)
            </span>
          </label>
          <div className="flex flex-wrap gap-4">
            {["undergrad", "freshgrad", "both"].map((t) => (
              <label
                key={t}
                className="flex items-center space-x-2 capitalize cursor-pointer text-gray-700 dark:text-gray-300"
              >
                <input
                  type="radio"
                  name="target"
                  value={t}
                  checked={formData.target === t}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Description{" "}
            <span className="text-gray-400 dark:text-gray-500 text-sm italic font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            name="description"
            rows="4"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Images{" "}
            <span className="text-gray-400 dark:text-gray-500 text-sm italic font-normal">
              (Optional, max 5)
            </span>
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors">
              <Upload size={20} />
              <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {images.length} images selected
            </span>
          </div>

          {/* Image Previews */}
          <div className="mt-4 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 group">
                <img
                  src={URL.createObjectURL(img)}
                  className="w-full h-full object-cover rounded border border-gray-300 dark:border-gray-600"
                  alt="preview"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded font-bold transition-all shadow-md"
        >
          {mutation.isPending ? "Posting..." : "Post Internship"}
        </button>
      </form>
    </div>
  );
};

export default PostInternship;
