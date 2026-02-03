import mongoose from 'mongoose';
import validator from 'validator';

const applicationSchema = new mongoose.Schema(
  {
    jobSeekerInfo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
      },
      name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Please provide a valid email address"],
      },
      phone: {
        type: Number,
        required: [true, "Phone number is required"],
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      resume: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      coverLetter: {
        type: String,
        required: [true, "Cover letter is required"],
        trim: true,
        minlength: [50, "Cover letter must be at least 50 characters"],
      },
      role: {
        type: String,
        enum: {
          values: ["jobSeeker"],
          message: "Role must be jobSeeker",
        },
        required: true,
        default: "jobSeeker",
      },
    },
    employerInfo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: {
          values: ["Employer"],
          message: "Role must be Employer",
        },
        required: true,
        default: "Employer",
      },
    },
    jobInfo: {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
      },
      jobTitle: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
      },
    },
    deletedBy: {
      jobSeeker: {
        type: Boolean,
        default: false,
      },
      employer: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, 
  }
);

applicationSchema.index({ "jobSeekerInfo.id": 1, "jobInfo.jobId": 1 });
applicationSchema.index({ "employerInfo.id": 1 });
applicationSchema.index({ createdAt: -1 });


applicationSchema.virtual("isDeleted").get(function () {
  return this.deletedBy.jobSeeker || this.deletedBy.employer;
});

applicationSchema.virtual("isPermanentlyDeleted").get(function () {
  return this.deletedBy.jobSeeker && this.deletedBy.employer;
});


applicationSchema.pre("save", function (next) {
  if (this.jobSeekerInfo.phone) {
    const phoneStr = this.jobSeekerInfo.phone.toString();
    if (phoneStr.length < 10 || phoneStr.length > 15) {
      next(new Error("Phone number must be between 10 and 15 digits"));
    }
  }
  next();
});


applicationSchema.methods.deleteByJobSeeker = async function () {
  this.deletedBy.jobSeeker = true;
  await this.save();
  return this;
};

applicationSchema.methods.deleteByEmployer = async function () {
  this.deletedBy.employer = true;
  await this.save();
  return this;
};

applicationSchema.statics.findActiveByJobSeeker = function (jobSeekerId) {
  return this.find({
    "jobSeekerInfo.id": jobSeekerId,
    "deletedBy.jobSeeker": false,
  }).sort({ createdAt: -1 });
};

applicationSchema.statics.findActiveByEmployer = function (employerId) {
  return this.find({
    "employerInfo.id": employerId,
    "deletedBy.employer": false,
  }).sort({ createdAt: -1 });
};


applicationSchema.statics.findByJob = function (jobId) {
  return this.find({
    "jobInfo.jobId": jobId,
    "deletedBy.employer": false,
  }).sort({ createdAt: -1 });
};

export const Application = mongoose.model("Application", applicationSchema);