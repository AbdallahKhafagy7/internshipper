const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

function asTrimmed(v) {
  if (v == null) return "";
  const s = String(v);
  if (s === "undefined" || s === "null") return "";
  return s.trim();
}
const { upload, cloudinary } = require("../config/cloudinary");

router.get("/", async (req, res) => {
  const { search, industry, target, sort, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const pageSize = parseInt(limit);

  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }
  if (industry && industry !== "All") {
    query.industry = industry;
  }
  if (target && target !== "all") {
    // Undergrad / fresh grad also match listings that target "both"
    if (target === "undergrad" || target === "freshgrad") {
      query.target = { $in: [target, "both"] };
    } else {
      query.target = target;
    }
  }

  try {
    const now = new Date();
    let internships;
    let total;

    if (sort === "deadline_ended") {
      const deadlineFilter = {
        $exists: true,
        $ne: null,
        $lt: now,
      };
      const listQuery = { ...query, deadline: deadlineFilter };
      total = await Internship.countDocuments(listQuery);
      internships = await Internship.find(listQuery)
        .populate("postedBy", "username")
        .sort({ deadline: -1 })
        .skip(skip)
        .limit(pageSize);
    } else if (sort === "deadline_soon") {
      const farFuture = new Date("9999-12-31T23:59:59.999Z");
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            _sortDeadline: { $ifNull: ["$deadline", farFuture] },
          },
        },
        { $sort: { _sortDeadline: 1, createdAt: -1 } },
        {
          $lookup: {
            from: User.collection.name,
            localField: "postedBy",
            foreignField: "_id",
            as: "_pb",
            pipeline: [{ $project: { username: 1 } }],
          },
        },
        { $unwind: { path: "$_pb", preserveNullAndEmptyArrays: true } },
        { $addFields: { postedBy: "$_pb" } },
        { $project: { _pb: 0, _sortDeadline: 0 } },
      ];

      // For aggregation, we need a separate count or use facet
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Internship.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;

      const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: pageSize }];
      internships = await Internship.aggregate(paginatedPipeline);
    } else {
      total = await Internship.countDocuments(query);
      internships = await Internship.find(query)
        .populate("postedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);
    }

    res.json({
      internships,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      industry,
      deadline,
      target,
      applyContact,
      location,
    } = req.body;
    const titleTrim = asTrimmed(title);
    const companyTrim = asTrimmed(company);
    const industryTrim = asTrimmed(industry);
    const applyTrim = asTrimmed(applyContact);

    if (!titleTrim || !companyTrim || !industryTrim || !applyTrim) {
      return res.status(400).json({
        message:
          "Title, company, industry, and apply link or email are required",
      });
    }

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const descTrim = asTrimmed(description);
    const locationTrim = asTrimmed(location);
    const deadlineStr = asTrimmed(deadline);
    const targetVal = asTrimmed(target);

    const payload = {
      title: titleTrim,
      company: companyTrim,
      industry: industryTrim,
      applyContact: applyTrim,
      description: descTrim || "",
      location: locationTrim || "",
      images: imageUrls,
      postedBy: req.user._id,
    };

    if (deadlineStr) {
      const d = new Date(deadlineStr);
      if (!Number.isNaN(d.getTime())) {
        payload.deadline = d;
      }
    }

    if (targetVal && ["undergrad", "freshgrad", "both"].includes(targetVal)) {
      payload.target = targetVal;
    }

    const internship = await Internship.create(payload);

    res.json(internships);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
    });

    router.get("/industries", async (req, res) => {
    try {
    const industries = await Internship.distinct("industry");
    res.json(industries);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
    });

    router.get("/:id", async (req, res) => {

  try {
    const internship = await Internship.findById(req.params.id).populate(
      "postedBy",
      "username",
    );
    if (!internship) {
      console.log(`Internship not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json(internship);
  } catch (error) {
    console.error(`Error fetching internship: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (
      internship.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this internship" });
    }

    for (const url of internship.images) {
      try {
        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`internshipper/${publicId}`);
      } catch (e) {
        /* ignore */
      }
    }

    await Internship.deleteOne({ _id: internship._id });
    res.json({ message: "Internship removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (
      internship.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this internship" });
    }

    const {
      title,
      company,
      description,
      industry,
      deadline,
      target,
      applyContact,
      location,
    } = req.body;

    if (title) internship.title = asTrimmed(title);
    if (company) internship.company = asTrimmed(company);
    if (description !== undefined)
      internship.description = asTrimmed(description);
    if (industry) internship.industry = asTrimmed(industry);
    if (applyContact) internship.applyContact = asTrimmed(applyContact);
    if (location !== undefined) internship.location = asTrimmed(location);

    if (deadline !== undefined) {
      const deadlineStr = asTrimmed(deadline);
      if (deadlineStr) {
        const d = new Date(deadlineStr);
        if (!Number.isNaN(d.getTime())) {
          internship.deadline = d;
        }
      } else {
        internship.deadline = null;
      }
    }

    if (target && ["undergrad", "freshgrad", "both"].includes(target)) {
      internship.target = target;
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      internship.images = [...internship.images, ...newImageUrls].slice(0, 5);
    }

    const updatedInternship = await internship.save();
    res.json(updatedInternship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
