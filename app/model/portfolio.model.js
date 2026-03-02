const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      required: true,
    },

    annualReturnRange: {
      min: Number,
      max: Number,
    },
    price:{
      price:Number,
    },
    performanceSummary: {
      averageAnnualROI: Number,       // 40-50
      maxRiskPerDay: Number,          // 0.8
      capitalExpiryDays: Number,      // 50L
      capitalNonExpiryDays: Number,   // 30L
      historicalMaxDD: Number,        // 1-1.5
    },

   
    statistics: {
      overallProfit: Number,
      winPercentage: Number,
      maxDrawdown: Number,
      
    },

    // CHARTS / IMAGES
    charts: {
      equityCurve: String,      
      monthlyReport: String,    
      performanceStats: String, 
    },

    // HIGHLIGHTS SECTION
    highlights: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const portfolioModel = mongoose.model("portfolio", portfolioSchema);
module.exports =portfolioModel;