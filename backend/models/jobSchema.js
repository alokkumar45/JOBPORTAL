import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    jobType: {
        type: String,
        required: [true, 'Job type is required'],
        enum: {
            values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
            message: 'Please select a valid job type'
        }
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    companyName: { 
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    introduction: {
        type: String,
        required: [true, 'Introduction is required'],
        trim: true,
    },
    responsibilities: {
        type: String,  
        required: [true, 'Responsibilities are required'],
        trim: true,
    },
    qualifications: {
        type: String, 
        required: [true, 'Qualifications are required'],
        trim: true,
    },
    offers: {
        type: String,
        trim: true,
    },
    salary: { 
        type: String,
        required: [true, 'Salary is required'],
        trim: true,
    },
    hiringMultipleCandidates: {
        type: String, 
        enum: ['Yes', 'No'],  // ✅ Changed from 'YES', 'NO' to 'Yes', 'No'
        default: "Yes",       // ✅ Changed default from "YES" to "Yes"
    },
    personalWebsite: { 
        title: {
            type: String,
            trim: true,
        },
        url: {
            type: String,
            trim: true,
        }
    },
    jobNiche: {
        type: String,
        required: [true, 'Job niche is required'],
        trim: true,
    },
    newslettersSent: {
        type: Boolean,
        default: false
    },
    jobPostedOn: { 
        type: Date,
        default: Date.now,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Employer ID is required'],
    },
}, {
    timestamps: true
});

// ✅ Add indexes for better query performance
jobSchema.index({ jobNiche: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });

// ✅ Virtual to check if job is expired
jobSchema.virtual('isExpired').get(function() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.jobPostedOn < thirtyDaysAgo;
});

// ✅ Method to populate employer details
jobSchema.methods.getEmployerDetails = async function() {
    await this.populate('postedBy', 'name email companyName');
    return this;
};

// ✅ Static method to find jobs by employer
jobSchema.statics.findByEmployer = function(employerId) {
    return this.find({ postedBy: employerId }).sort({ createdAt: -1 });
};

// ✅ Static method to find active jobs in a niche
jobSchema.statics.findByNiche = function(niche) {
    return this.find({ jobNiche: niche }).sort({ createdAt: -1 });
};

// ✅ Pre-save middleware to validate postedBy exists
jobSchema.pre('save', function(next) {
    if (!this.postedBy) {
        next(new Error('Job must have an employer (postedBy is required)'));
    }
    next();
});

export const Job = mongoose.model('Job', jobSchema);