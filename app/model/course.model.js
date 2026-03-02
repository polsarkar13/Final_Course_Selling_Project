const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    details: {
      durationDays: Number,
      rating: Number,
      studentsEnrolled: Number,
      price:Number,
      originalPrice:Number,
    },
    // CourseImage
    image: {
      thumbnail: String,
    },
    // About this Course
    description: {
      type: String,
      required: true,
    },

    // Inside the Course
    highlights: [
      {
        type: String,
      },
    ],
    // Course Modules
    courseModules: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
