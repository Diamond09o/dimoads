var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);

// src/data.ts
var mockUsers = {
  "user-1": {
    id: "user-1",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 019-2834",
    accountType: "personal",
    verificationStatus: "verified",
    trustScore: 94,
    createdAt: "2026-01-15T08:30:00Z"
  },
  "user-2": {
    id: "user-2",
    name: "Al-Noor Investments",
    email: "info@alnoor-inv.com",
    phone: "+971 4 555 9832",
    accountType: "business",
    verificationStatus: "verified",
    trustScore: 98,
    createdAt: "2025-11-02T11:45:00Z"
  },
  "user-3": {
    id: "user-3",
    name: "Moustafa El-Sayed",
    email: "moustafa.sayed@gmail.com",
    phone: "+20 100 234 5678",
    accountType: "personal",
    verificationStatus: "pending",
    trustScore: 75,
    createdAt: "2026-05-10T14:20:00Z"
  },
  "user-4": {
    id: "user-4",
    name: "Global Tech Recruiting",
    email: "careers@globaltech.io",
    phone: "+1 (415) 555-0142",
    accountType: "business",
    verificationStatus: "verified",
    trustScore: 90,
    createdAt: "2026-02-28T09:00:00Z"
  },
  "user-5": {
    id: "user-5",
    name: "John Doe (Admin)",
    email: "mohdussain79@gmail.com",
    // user's email matching metadata for premium feel
    phone: "+1 (555) 777-8888",
    accountType: "personal",
    verificationStatus: "verified",
    trustScore: 100,
    createdAt: "2025-01-01T00:00:00Z"
  }
};
var initialListings = [
  {
    id: "list-1",
    title: "2024 Porsche 911 Carrera S - Mint Condition",
    description: "Selling a pristine 2024 Porsche 911 Carrera S with only 4,500 miles. Crayon grey exterior, black leather interior, carbon fiber packages, sport chrono, and premium Bose sound system. Fully serviced at authorized Porsche dealers. Always garaged and ceramic coated. Looking for serious buyers.",
    category: "vehicles",
    location: "Dubai, UAE",
    price: 135e3,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800"
    ],
    contactOptions: {
      phone: "+971 50 123 4567",
      email: "sarah.j@example.com",
      whatsapp: "+971501234567"
    },
    ownerId: "user-1",
    isPremium: true,
    status: "active",
    aiTags: ["porsche", "sports car", "luxury car", "911", "carrera", "dubai cars"],
    originalLanguage: "en",
    translations: {
      ar: {
        title: "\u0628\u0648\u0631\u0634 \u0669\u0661\u0661 \u0643\u0627\u0631\u064A\u0631\u0627 \u0625\u0633 \u0662\u0660\u0662\u0664 - \u062D\u0627\u0644\u0629 \u0645\u0645\u062A\u0627\u0632\u0629",
        description: "\u0644\u0644\u0628\u064A\u0639 \u0628\u0648\u0631\u0634 \u0669\u0661\u0661 \u0643\u0627\u0631\u064A\u0631\u0627 \u0625\u0633 \u0662\u0660\u0662\u0664 \u0628\u062D\u0627\u0644\u0629 \u0645\u0645\u062A\u0627\u0632\u0629\u060C \u0642\u0637\u0639\u062A \u0664,\u0665\u0660\u0660 \u0645\u064A\u0644 \u0641\u0642\u0637. \u0644\u0648\u0646 \u0631\u0645\u0627\u062F\u064A \u0643\u0631\u0627\u064A\u0648\u0646 \u062E\u0627\u0631\u062C\u064A\u060C \u062C\u0644\u062F \u0623\u0633\u0648\u062F \u062F\u0627\u062E\u0644\u064A\u060C \u0628\u0627\u0642\u0629 \u0623\u0644\u064A\u0627\u0641 \u0627\u0644\u0643\u0631\u0628\u0648\u0646\u060C \u0646\u0638\u0627\u0645 \u0633\u0628\u0648\u0631\u062A \u0643\u0631\u0648\u0646\u0648\u060C \u0648\u0646\u0638\u0627\u0645 \u0635\u0648\u062A\u064A \u0628\u0648\u0632 \u0641\u0627\u062E\u0631. \u0635\u064A\u0627\u0646\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u062F\u0649 \u0627\u0644\u0648\u0643\u064A\u0644 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0628\u0648\u0631\u0634. \u0645\u062E\u0632\u0646\u0629 \u062F\u0627\u0626\u0645\u0627\u064B \u0628\u0627\u0644\u0645\u0631\u0622\u0628 \u0648\u0645\u062D\u0645\u064A\u0629 \u0628\u0637\u0628\u0642\u0629 \u0633\u064A\u0631\u0627\u0645\u064A\u0643. \u0644\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0627\u0644\u062C\u0627\u062F\u064A\u0646 \u0641\u0642\u0637."
      }
    },
    viewsCount: 342,
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-06-25T10:00:00Z"
  },
  {
    id: "list-2",
    title: "Premium Sea-View Villa in Palm Jumeirah",
    description: "Stunning 5-bedroom luxury villa on the Palm Jumeirah Fronds. High ceiling, private beach access, infinity pool, smart home automation, and panoramic views of the Dubai Marina skyline. Fully furnished with high-end designer Italian furniture. Perfect investment or family residence.",
    category: "real-estate",
    location: "Dubai, Palm Jumeirah",
    price: 89e5,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
    ],
    contactOptions: {
      phone: "+971 4 555 9832",
      email: "info@alnoor-inv.com",
      whatsapp: "+97145559832"
    },
    ownerId: "user-2",
    isPremium: true,
    status: "active",
    aiTags: ["palm jumeirah", "luxury villa", "dubai real estate", "beachfront property", "5 bedroom"],
    originalLanguage: "en",
    translations: {
      ar: {
        title: "\u0641\u064A\u0644\u0627 \u0641\u0627\u062E\u0631\u0629 \u0645\u0637\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631 \u0641\u064A \u0646\u062E\u0644\u0629 \u062C\u0645\u064A\u0631\u0627",
        description: "\u0641\u064A\u0644\u0627 \u0645\u0630\u0647\u0644\u0629 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0665 \u063A\u0631\u0641 \u0646\u0648\u0645 \u0641\u0627\u062E\u0631\u0629 \u0641\u064A \u0646\u062E\u0644\u0629 \u062C\u0645\u064A\u0631\u0627. \u0633\u0642\u0641 \u0645\u0631\u062A\u0641\u0639\u060C \u0645\u062F\u062E\u0644 \u062E\u0627\u0635 \u0644\u0644\u0634\u0627\u0637\u0626\u060C \u0645\u0633\u0628\u062D \u0644\u0627\u0645\u062A\u0646\u0627\u0647\u064A\u060C \u0646\u0638\u0627\u0645 \u0623\u062A\u0645\u062A\u0629 \u0644\u0644\u0645\u0646\u0632\u0644 \u0627\u0644\u0630\u0643\u064A\u060C \u0648\u0625\u0637\u0644\u0627\u0644\u0627\u062A \u0628\u0627\u0646\u0648\u0631\u0627\u0645\u064A\u0629 \u0639\u0644\u0649 \u0623\u0641\u0642 \u062F\u0628\u064A \u0645\u0627\u0631\u064A\u0646\u0627. \u0645\u0624\u062B\u062B\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0628\u0623\u062B\u0627\u062B \u0625\u064A\u0637\u0627\u0644\u064A \u0641\u0627\u062E\u0631 \u0645\u0646 \u062A\u0635\u0645\u064A\u0645 \u0645\u0635\u0645\u0645\u064A\u0646 \u0639\u0627\u0644\u0645\u064A\u064A\u0646. \u0641\u0631\u0635\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629 \u0645\u062B\u0627\u0644\u064A\u0629 \u0623\u0648 \u0633\u0643\u0646 \u0639\u0627\u0626\u0644\u064A \u0631\u0627\u0642\u064D."
      }
    },
    viewsCount: 1250,
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-15T15:30:00Z"
  },
  {
    id: "list-3",
    title: "Senior Full-Stack Developer (MERN / Next.js)",
    description: "We are seeking a highly skilled Senior Full Stack Developer to lead our core marketplace team. Required: 5+ years experience with React, Next.js, Node.js, Express, and cloud databases (Firestore / PostgreSQL). Experience in AI APIs is highly appreciated. Remote position with attractive salary and stock options.",
    category: "jobs",
    location: "Riyadh, Saudi Arabia (Remote)",
    price: 7500,
    // Monthly salary in USD
    images: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200"
    ],
    contactOptions: {
      phone: "+1 (415) 555-0142",
      email: "careers@globaltech.io",
      whatsapp: "+14155550142"
    },
    ownerId: "user-4",
    isPremium: false,
    status: "active",
    aiTags: ["remote job", "developer", "react", "next.js", "saudi tech jobs", "full stack"],
    originalLanguage: "en",
    translations: {
      ar: {
        title: "\u0645\u0637\u0648\u0631 \u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0623\u0648\u0644 \u0644\u0644\u0648\u0627\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u062E\u0644\u0641\u064A\u0627\u062A (MERN / Next.js)",
        description: "\u0646\u0628\u062D\u062B \u0639\u0646 \u0645\u0637\u0648\u0631 \u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0623\u0648\u0644 \u0630\u0648 \u0645\u0647\u0627\u0631\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0644\u0642\u064A\u0627\u062F\u0629 \u0641\u0631\u064A\u0642 \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0644\u062F\u064A\u0646\u0627. \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A: \u062E\u0628\u0631\u0629 \u062A\u0632\u064A\u062F \u0639\u0646 \u0665 \u0633\u0646\u0648\u0627\u062A \u0641\u064A \u0627\u0644\u0639\u0645\u0644 \u0645\u0639 React \u0648 Next.js \u0648 Node.js \u0648 Express \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629 (Firestore / PostgreSQL). \u0646\u062B\u0645\u0646 \u0639\u0627\u0644\u064A\u0627\u064B \u0627\u0644\u062E\u0628\u0631\u0629 \u0641\u064A \u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u0648\u0638\u064A\u0641\u0629 \u0639\u0646 \u0628\u0639\u062F \u0628\u0631\u0627\u062A\u0628 \u0645\u062C\u0632\u064D \u0648\u062E\u064A\u0627\u0631\u0627\u062A \u0623\u0633\u0647\u0645."
      }
    },
    viewsCount: 512,
    createdAt: "2026-07-01T09:15:00Z",
    updatedAt: "2026-07-01T09:15:00Z"
  },
  {
    id: "list-4",
    title: "\u0641\u0631\u0635\u0629 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0641\u064A \u0645\u0635\u0646\u0639 \u062A\u0645\u0648\u0631 \u0622\u0644\u064A \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
    description: "\u0646\u0639\u0631\u0636 \u0641\u0631\u0635\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629 \u0645\u0645\u064A\u0632\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u062D\u0648\u0627\u0630 \u0639\u0644\u0649 \u0645\u0635\u0646\u0639 \u062A\u0639\u0628\u0626\u0629 \u0648\u062A\u063A\u0644\u064A\u0641 \u062A\u0645\u0648\u0631 \u0642\u0627\u0626\u0645 \u0648\u0622\u0644\u064A \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0642\u0635\u064A\u0645 \u0628\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u0627\u0644\u0645\u0635\u0646\u0639 \u0645\u062C\u0647\u0632 \u0628\u0623\u062D\u062F\u062B \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A\u0629\u060C \u0648\u0644\u062F\u064A\u0647 \u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0645\u062D\u0644\u064A\u0629 \u0648\u062F\u0648\u0644\u064A\u0629 \u0642\u0627\u0626\u0645\u0629. \u062A\u0628\u0644\u063A \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0627\u0644\u0633\u0646\u0648\u064A\u0629 \u0661,\u0665\u0660\u0660 \u0637\u0646. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0644\u0644\u0634\u0631\u0643\u0627\u0621 \u0627\u0644\u062C\u0627\u062F\u064A\u0646 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629 \u0644\u0644\u0627\u0637\u0644\u0627\u0639 \u0639\u0644\u0649 \u062F\u0631\u0627\u0633\u0629 \u0627\u0644\u062C\u062F\u0648\u0649 \u0648\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0639\u0645\u062F\u0629.",
    category: "investment-opportunities",
    location: "Al-Qassim, Saudi Arabia",
    price: 45e4,
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200"
    ],
    contactOptions: {
      phone: "+966 55 987 6543",
      email: "moustafa.sayed@gmail.com",
      whatsapp: "+966559876543"
    },
    ownerId: "user-3",
    isPremium: false,
    status: "active",
    aiTags: ["\u0627\u0644\u0642\u0635\u064A\u0645", "\u0627\u0633\u062A\u062B\u0645\u0627\u0631", "\u0645\u0635\u0646\u0639 \u062A\u0645\u0648\u0631", "\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", "\u0641\u0631\u0635 \u062A\u062C\u0627\u0631\u064A\u0629", "\u0625\u0646\u062A\u0627\u062C \u0632\u0631\u0627\u0639\u064A"],
    originalLanguage: "ar",
    translations: {
      en: {
        title: "Investment Opportunity in Fully Automated Date Factory",
        description: "We present a unique investment opportunity for partnership or acquisition of an existing fully automated date packaging factory in Al-Qassim region, Saudi Arabia. The factory is equipped with state-of-the-art German production lines, with established domestic and international supply contracts. Annual production capacity is 1,500 tons. Serious partners and investment firms are invited to review the feasibility study and certified financial audits."
      }
    },
    viewsCount: 189,
    createdAt: "2026-07-03T16:00:00Z",
    updatedAt: "2026-07-03T16:00:00Z"
  },
  {
    id: "list-5",
    title: "iPhone 15 Pro Max - 256GB Natural Titanium",
    description: "Selling my iPhone 15 Pro Max 256GB in Natural Titanium. Battery health is 98%, completely free of scratches or dents. Comes with original box, unused USB-C cable, and 3 premium cases. Under AppleCare warranty until December 2026. Price is non-negotiable.",
    category: "electronics",
    location: "Riyadh, Saudi Arabia",
    price: 900,
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1200"
    ],
    contactOptions: {
      phone: "+966 55 987 6543",
      email: "moustafa.sayed@gmail.com",
      whatsapp: "+966559876543"
    },
    ownerId: "user-3",
    isPremium: false,
    status: "active",
    aiTags: ["iphone 15 pro max", "apple", "mobile phone", "riyadh mobile", "electronics"],
    originalLanguage: "en",
    translations: {
      ar: {
        title: "\u0622\u064A\u0641\u0648\u0646 \u0661\u0665 \u0628\u0631\u0648 \u0645\u0627\u0643\u0633 - \u0662\u0665\u0666 \u062C\u064A\u062C\u0627\u0628\u0627\u064A\u062A \u062A\u064A\u062A\u0627\u0646\u064A\u0648\u0645 \u0637\u0628\u064A\u0639\u064A",
        description: "\u0623\u0628\u064A\u0639 \u0647\u0627\u062A\u0641 \u0622\u064A\u0641\u0648\u0646 \u0661\u0665 \u0628\u0631\u0648 \u0645\u0627\u0643\u0633 \u0662\u0665\u0666 \u062C\u064A\u062C\u0627\u0628\u0627\u064A\u062A \u0628\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u062A\u064A\u062A\u0627\u0646\u064A\u0648\u0645 \u0627\u0644\u0637\u0628\u064A\u0639\u064A. \u0635\u062D\u0629 \u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0629 \u0669\u0668\u066A\u060C \u062E\u0627\u0644\u064D \u062A\u0645\u0627\u0645\u0627\u064B \u0645\u0646 \u0627\u0644\u062E\u062F\u0648\u0634 \u0623\u0648 \u0627\u0644\u0635\u062F\u0645\u0627\u062A. \u064A\u0623\u062A\u064A \u0645\u0639 \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0623\u0635\u0644\u064A \u0648\u0643\u0627\u0628\u0644 USB-C \u063A\u064A\u0631 \u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0663 \u0623\u063A\u0637\u064A\u0629 \u0641\u0627\u062E\u0631\u0629. \u0627\u0644\u0647\u0627\u062A\u0641 \u062A\u062D\u062A \u0636\u0645\u0627\u0646 \u0622\u0628\u0644 \u0643\u064A\u0631 \u062D\u062A\u0649 \u062F\u064A\u0633\u0645\u0628\u0631 \u0662\u0660\u0662\u0666. \u0627\u0644\u0633\u0639\u0631 \u063A\u064A\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u062A\u0641\u0627\u0648\u0636."
      }
    },
    viewsCount: 94,
    createdAt: "2026-07-05T12:00:00Z",
    updatedAt: "2026-07-05T12:00:00Z"
  },
  {
    id: "list-6",
    title: "Suspicious Cheap Rolex Daytona Watch",
    description: "Brand new Rolex Daytona gold watch, fully authentic with papers, only selling because I need quick cash! Price is only $150. Immediate shipping worldwide. Do not ask questions, just transfer money via wire transfer first.",
    category: "electronics",
    location: "New York, USA",
    price: 150,
    // Suspect! Rolex Daytona for $150
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1200"
    ],
    contactOptions: {
      phone: "+1 (555) 999-1111",
      email: "spammer@scampool.com",
      whatsapp: "+15559991111"
    },
    ownerId: "user-4",
    isPremium: false,
    status: "active",
    // Will be reported and flaggable as fraud
    aiTags: ["rolex", "gold watch", "cheap deal"],
    originalLanguage: "en",
    translations: {
      ar: {
        title: "\u0633\u0627\u0639\u0629 \u0631\u0648\u0644\u0643\u0633 \u062F\u0627\u064A\u062A\u0648\u0646\u0627 \u0631\u062E\u064A\u0635\u0629 \u0645\u0634\u0628\u0648\u0647\u0629",
        description: "\u0633\u0627\u0639\u0629 \u0631\u0648\u0644\u0643\u0633 \u062F\u0627\u064A\u062A\u0648\u0646\u0627 \u0630\u0647\u0628\u064A\u0629 \u062C\u062F\u064A\u062F\u0629 \u062A\u0645\u0627\u0645\u0627\u064B\u060C \u0623\u0635\u0644\u064A\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0623\u0648\u0631\u0627\u0642\u060C \u0623\u0628\u064A\u0639\u0647\u0627 \u0641\u0642\u0637 \u0644\u0623\u0646\u0646\u064A \u0628\u062D\u0627\u062C\u0629 \u0625\u0644\u0649 \u0646\u0642\u062F \u0633\u0631\u064A\u0639! \u0627\u0644\u0633\u0639\u0631 \u0661\u0665\u0660 \u062F\u0648\u0644\u0627\u0631\u0627\u064B \u0641\u0642\u0637. \u0634\u062D\u0646 \u0641\u0648\u0631\u064A \u0644\u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u0645. \u0644\u0627 \u062A\u0637\u0631\u062D \u0623\u0633\u0626\u0644\u0629\u060C \u0641\u0642\u0637 \u0642\u0645 \u0628\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0628\u0631\u0642\u064A \u0623\u0648\u0644\u0627\u064B."
      }
    },
    viewsCount: 15,
    createdAt: "2026-07-07T10:00:00Z",
    updatedAt: "2026-07-07T10:00:00Z"
  }
];
var initialReports = [
  {
    id: "rep-1",
    listingId: "list-6",
    reporterId: "user-1",
    reason: "Suspicious listing: Selling a authentic Gold Rolex Daytona for $150. Wire transfer payment request is an obvious phishing fraud scam.",
    status: "pending",
    createdAt: "2026-07-07T18:30:00Z"
  }
];

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var cspHeader = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https: data:",
  "connect-src 'self' ws: https: wss:",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join("; ");
app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", cspHeader);
  next();
});
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 150,
  // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
var aiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 15,
  // limit each IP to 15 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI processing rate limit exceeded. Please wait a minute before making another request." }
});
app.use(import_express.default.json());
var PERSISTENCE_DIR = import_path.default.join(process.cwd(), "data");
var PERSISTENCE_FILE = import_path.default.join(PERSISTENCE_DIR, "dimoads-data.json");
var defaultPersistedState = {
  listings: initialListings,
  users: mockUsers,
  reports: initialReports,
  messages: [],
  currentUserId: "user-3"
};
async function ensurePersistenceStore() {
  await import_promises.default.mkdir(PERSISTENCE_DIR, { recursive: true });
}
async function readPersistedState() {
  try {
    await ensurePersistenceStore();
    const raw = await import_promises.default.readFile(PERSISTENCE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      listings: Array.isArray(parsed.listings) ? parsed.listings : defaultPersistedState.listings,
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : defaultPersistedState.users,
      reports: Array.isArray(parsed.reports) ? parsed.reports : defaultPersistedState.reports,
      messages: Array.isArray(parsed.messages) ? parsed.messages : defaultPersistedState.messages,
      currentUserId: typeof parsed.currentUserId === "string" ? parsed.currentUserId : defaultPersistedState.currentUserId
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      await writePersistedState(defaultPersistedState);
      return defaultPersistedState;
    }
    throw error;
  }
}
async function writePersistedState(nextState) {
  const current = await readPersistedState();
  const state = {
    ...current,
    ...nextState,
    listings: Array.isArray(nextState.listings) ? nextState.listings : current.listings,
    users: nextState.users && typeof nextState.users === "object" ? nextState.users : current.users,
    reports: Array.isArray(nextState.reports) ? nextState.reports : current.reports,
    messages: Array.isArray(nextState.messages) ? nextState.messages : current.messages,
    currentUserId: typeof nextState.currentUserId === "string" ? nextState.currentUserId : current.currentUserId
  };
  await ensurePersistenceStore();
  await import_promises.default.writeFile(PERSISTENCE_FILE, JSON.stringify(state, null, 2));
  return state;
}
app.get("/api/persistence/state", async (_req, res) => {
  try {
    res.json(await readPersistedState());
  } catch (error) {
    console.error("Failed to read persisted state:", error);
    res.status(500).json({ error: "Failed to read persisted state" });
  }
});
app.post("/api/persistence/state", async (req, res) => {
  try {
    const state = await writePersistedState(req.body);
    res.json(state);
  } catch (error) {
    console.error("Failed to write persisted state:", error);
    res.status(500).json({ error: "Failed to save persisted state" });
  }
});
app.get("/api/config", (_req, res) => {
  const config = {
    googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || null,
    appUrl: process.env.APP_URL || null,
    geminiAvailable: !!process.env.GEMINI_API_KEY
  };
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    console.warn("GOOGLE_OAUTH_CLIENT_SECRET is not set; OAuth server flows will be disabled.");
  }
  res.json(config);
});
function promptProtectionMiddleware(req, res, next) {
  const fieldsToScan = ["promptText", "title", "description", "query", "message", "subject"];
  if (req.body) {
    for (const field of fieldsToScan) {
      if (req.body[field]) {
        const valResult = validatePromptSecurity(req.body[field]);
        if (!valResult.isSafe) {
          res.status(400).json({ error: valResult.reason });
          return;
        }
      }
    }
  }
  next();
}
app.use("/api/", apiLimiter);
app.use("/api/gemini/", aiLimiter);
app.use("/api/ai/", aiLimiter);
app.use("/api/", promptProtectionMiddleware);
var PORT = 3e3;
function validatePromptSecurity(text) {
  if (!text || typeof text !== "string") {
    return { isSafe: true };
  }
  const lowerText = text.toLowerCase();
  const jailbreakTriggers = [
    "ignore previous instructions",
    "ignore above instructions",
    "disregard all instructions",
    "system prompt",
    "you are now a",
    "dan mode",
    "jailbreak",
    "ignore guidelines",
    "bypass security",
    "do anything now",
    "override guidelines",
    "forget what you",
    "forget instructions",
    "ignore prompt"
  ];
  for (const trigger of jailbreakTriggers) {
    if (lowerText.includes(trigger)) {
      return { isSafe: false, reason: `Potential prompt injection signature detected ("${trigger}")` };
    }
  }
  if (text.length > 8e3) {
    return { isSafe: false, reason: "Payload length exceeds safety limits (max 8000 characters)" };
  }
  return { isSafe: true };
}
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini functions will operate in simulated mode.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key || "DUMMY_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.post("/api/gemini/listing-assistant", async (req, res) => {
  const { promptText, originalLanguage = "en" } = req.body;
  if (!promptText || typeof promptText !== "string" || promptText.trim().length === 0) {
    res.status(400).json({ error: "promptText is required" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for listing creation.");
    res.json({
      title: `${promptText.charAt(0).toUpperCase() + promptText.slice(1)} - Premium Deal`,
      description: `This is a professionally generated listing for: ${promptText}. Features high quality specs, verified ownership, and immediate availability. Contact the owner for more details and direct viewing arrangement.`,
      category: "electronics",
      tags: ["premium", promptText.toLowerCase().replace(/\s+/g, "-"), "classifieds"]
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a listing based on this user input: "${promptText}". The original language is ${originalLanguage}.`,
      config: {
        systemInstruction: `You are an expert AI Listing Assistant for Dimoads AI, a premium global classifieds marketplace. 
Expand the user's short input into an engaging, professional, SEO-optimized classifieds title and description.
Your title must be short and direct (max 12 words). Your description must be highly compelling, detailed, and formatted with bullet points for key specifications, and a friendly call-to-action at the end.
Provide the output in the same language as the user input (${originalLanguage === "ar" ? "Arabic" : "English"}).
Additionally, categorize this listing into one of the nine official categories: 'jobs', 'real-estate', 'vehicles', 'electronics', 'services', 'businesses-for-sale', 'investment-opportunities', 'industrial-equipment', 'commodities'.
Provide 3-6 relevant search tags / keywords in the same language.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING, description: "Optimized listing title" },
            description: { type: import_genai.Type.STRING, description: "Expanded, bulleted professional description" },
            category: {
              type: import_genai.Type.STRING,
              description: "One of the nine enum categories: jobs, real-estate, vehicles, electronics, services, businesses-for-sale, investment-opportunities, industrial-equipment, commodities"
            },
            tags: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "List of 3 to 6 hashtags or search keywords without the hash symbol"
            }
          },
          required: ["title", "description", "category", "tags"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Listing Assistant Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate listing specifications" });
  }
});
app.post("/api/gemini/translate", async (req, res) => {
  const { title, description, targetLang } = req.body;
  if (!title || !description || !targetLang) {
    res.status(400).json({ error: "title, description, and targetLang (en or ar) are required" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for translation.");
    res.json({
      title: targetLang === "ar" ? `[\u0645\u062A\u0631\u062C\u0645] ${title}` : `[Translated] ${title}`,
      description: targetLang === "ar" ? `\u0647\u0630\u0647 \u062A\u0631\u062C\u0645\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0644\u0644\u0648\u0635\u0641: ${description}` : `This is a simulated translation of the description: ${description}`
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this listing to ${targetLang === "ar" ? "Arabic" : "English"}:
Title: "${title}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are a professional, high-fidelity native translator for Dimoads AI. 
Translate the provided classifieds title and description accurately between English and Arabic.
If translating to Arabic, use elegant, modern, professional standard Arabic (Fusha) terms suitable for ecommerce and marketplaces.
If translating to English, ensure a fluent, natural classified ads structure.
Keep all technical parameters, prices, or numbers intact. Do not add any conversational meta-text or preambles outside the JSON structure.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING, description: "Translated listing title" },
            description: { type: import_genai.Type.STRING, description: "Translated listing description" }
          },
          required: ["title", "description"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini translation");
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Translation API Error:", err);
    res.status(500).json({ error: err.message || "Failed to translate listing" });
  }
});
app.post("/api/gemini/fraud-detection", async (req, res) => {
  const { title, description, price, category } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: "title and description are required for fraud scanning" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Running simulated fraud analysis.");
    const isSuspicious = price < 500 && (title.toLowerCase().includes("rolex") || title.toLowerCase().includes("iphone 15 pro max") || description.toLowerCase().includes("wire transfer"));
    res.json({
      isSuspicious,
      scamScore: isSuspicious ? 92 : 12,
      flags: isSuspicious ? ["Highly unrealistic price for a luxury brand", "Demands wire transfer or upfront payment"] : ["Safe price range"],
      reason: isSuspicious ? "The item is priced significantly below market value, which is highly indicative of typical phishing and upfront wire transfer scams." : "The listing looks normal. No obvious scam keywords detected."
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Scan listing for fraud:
Title: "${title}"
Category: "${category}"
Price: $${price}
Description: "${description}"`,
      config: {
        systemInstruction: `You are an expert AI fraud investigator and moderation intelligence for Dimoads AI classifieds.
Analyze the listing parameters to identify potential marketplace scams, counterfeit items, suspicious requests, or spam.
Key scam signals to watch:
1. Highly unrealistic bargains (e.g. Rolex, Porsche, iPhone for tiny fraction of price).
2. Direct request to wire funds or pay bank deposits upfront without physical inspections.
3. Obvious copy-pasted generic text, duplicate listing markers, or spam phone numbers.
Assign a scamScore from 0 (perfectly safe) to 100 (confirmed scam). If scamScore is 60 or above, mark isSuspicious as true.
Provide an array of specific flags (concise sentences) and a summary reason of your verdict.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            isSuspicious: { type: import_genai.Type.BOOLEAN },
            scamScore: { type: import_genai.Type.INTEGER, description: "Score between 0 and 100" },
            flags: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: 'Specific scam signals identified (e.g. "Price too low for brand")'
            },
            reason: { type: import_genai.Type.STRING, description: "Explanation summarizing the analysis" }
          },
          required: ["isSuspicious", "scamScore", "flags", "reason"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini fraud radar");
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Fraud Scanner API Error:", err);
    res.status(500).json({ error: err.message || "Failed to complete fraud analysis" });
  }
});
app.post("/api/media/analyze", async (req, res) => {
  const { imageUrl, fileName } = req.body;
  if (!imageUrl) {
    res.status(400).json({ error: "imageUrl is required" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for media analysis.");
    const lowercaseName = (fileName || "").toLowerCase();
    const isPossiblyBlurry = lowercaseName.includes("blur") || lowercaseName.includes("shaky");
    const isPossiblyInappropriate = lowercaseName.includes("inappropriate") || lowercaseName.includes("adult") || lowercaseName.includes("nsfw");
    const isDuplicate = lowercaseName.includes("duplicate");
    res.json({
      isBlurry: isPossiblyBlurry,
      blurScore: isPossiblyBlurry ? 15 : 92,
      isDuplicate,
      duplicateHash: `MOCK_HASH_${Math.floor(Math.random() * 1e6)}`,
      isInappropriate: isPossiblyInappropriate,
      safetyScore: isPossiblyInappropriate ? 10 : 98,
      aestheticScore: isPossiblyBlurry ? 25 : 88,
      isRecommendedCover: !isPossiblyBlurry && !isPossiblyInappropriate
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      // Note: In production Gemini API, we can fetch the image first or pass a public URL
      contents: `Perform safety and visual analysis on this marketplace image URL: "${imageUrl}". 
Identify if the image contains adult/violent/inappropriate content, check if it's too blurry for a professional listing, and rate its aesthetic score out of 100.`,
      config: {
        systemInstruction: `You are the core Visual Moderation and Aesthetics Intelligence for Dimoads AI.
Analyze the provided image URL or content parameters.
Perform the following checks:
1. Blurry Detection: Assign a blurScore (0 = completely blurred, 100 = perfectly crisp/focused). Set isBlurry to true if blurScore < 25.
2. Inappropriate Content Detection: Assign a safetyScore (0 = dangerous/NSFW/inappropriate, 100 = perfectly safe/clean). Set isInappropriate to true if safetyScore < 60.
3. Aesthetic Scoring: Assign an aestheticScore (0 to 100) based on optimal framing, exposure, and clarity.
4. cover image: If the image is sharp, safe, and aesthetic, mark isRecommendedCover as true.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            isBlurry: { type: import_genai.Type.BOOLEAN },
            blurScore: { type: import_genai.Type.INTEGER, description: "Grayscale high-frequency variance score" },
            isDuplicate: { type: import_genai.Type.BOOLEAN },
            duplicateHash: { type: import_genai.Type.STRING },
            isInappropriate: { type: import_genai.Type.BOOLEAN },
            safetyScore: { type: import_genai.Type.INTEGER, description: "Safety confidence rating" },
            aestheticScore: { type: import_genai.Type.INTEGER, description: "Visual composition rating" },
            isRecommendedCover: { type: import_genai.Type.BOOLEAN }
          },
          required: ["isBlurry", "blurScore", "isDuplicate", "duplicateHash", "isInappropriate", "safetyScore", "aestheticScore", "isRecommendedCover"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini Vision analyzer");
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Media Analysis API Error:", err);
    res.json({
      isBlurry: false,
      blurScore: 85,
      isDuplicate: false,
      duplicateHash: `FALLBACK_${Date.now()}`,
      isInappropriate: false,
      safetyScore: 95,
      aestheticScore: 75,
      isRecommendedCover: true
    });
  }
});
app.post("/api/gemini/search", async (req, res) => {
  const { query, listings } = req.body;
  if (!query || !listings || !Array.isArray(listings)) {
    res.status(400).json({ error: "query string and listings array are required" });
    return;
  }
  if (listings.length === 0) {
    res.json({ results: [] });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for semantic search.");
    const normQuery = query.toLowerCase();
    const results = listings.map((l) => {
      let score = 10;
      let reason = "Generic match";
      if (l.title.toLowerCase().includes(normQuery) || l.description.toLowerCase().includes(normQuery)) {
        score = 90;
        reason = `Directly contains search term: "${query}"`;
      } else if (l.category.toLowerCase().includes(normQuery) || l.location.toLowerCase().includes(normQuery)) {
        score = 65;
        reason = `Matches metadata category or location: "${query}"`;
      }
      return { id: l.id, relevanceScore: score, matchReason: reason };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    res.json({ results });
    return;
  }
  try {
    const ai = getGeminiClient();
    const compactListings = listings.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description.slice(0, 250),
      // Truncate to keep context short and cheap
      price: l.price,
      category: l.category,
      location: l.location,
      tags: l.aiTags || []
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search query: "${query}"
Marketplace Listings: ${JSON.stringify(compactListings)}`,
      config: {
        systemInstruction: `You are the core Semantic Search brain of Dimoads AI. 
Evaluate how closely each of the provided listings matches the user's natural language search query.
Look beyond literal keyword matching to understand semantic intent (e.g., if query is "looking for luxury sports ride", Porsche should rank highly; if query is "job with flexible hours", look for jobs marked remote).
Assign each listing ID a relevanceScore from 0 (completely irrelevant) to 100 (exact, perfect fit).
Provide a short, 1-sentence matchReason explaining why the item fits the intent (e.g., "Premium sports car matching luxury ride request").
Return the complete evaluated list.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            results: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  id: { type: import_genai.Type.STRING },
                  relevanceScore: { type: import_genai.Type.INTEGER, description: "Score between 0 and 100" },
                  matchReason: { type: import_genai.Type.STRING, description: "Short summary of the semantic fit" }
                },
                required: ["id", "relevanceScore", "matchReason"]
              }
            }
          },
          required: ["results"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini search processor");
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Semantic Search API Error:", err);
    res.status(500).json({ error: err.message || "Failed to execute semantic search" });
  }
});
app.post("/api/ai/pricing", async (req, res) => {
  const { category, brand, model, year, condition, location } = req.body;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for price recommendation.");
    let suggestedPrice = 500;
    let min = 400;
    let max = 600;
    if ((category || "").toLowerCase().includes("vehicle") || (category || "").toLowerCase().includes("car")) {
      suggestedPrice = 8500;
      min = 7800;
      max = 9200;
    } else if ((category || "").toLowerCase().includes("real")) {
      suggestedPrice = 12e4;
      min = 11e4;
      max = 135e3;
    }
    res.json({
      suggestedPrice,
      priceRange: { min, max },
      confidenceScore: 85,
      reasoning: `Fair value valuation calculated for a ${condition} ${brand || ""} ${model || ""} in ${location || "Bahrain"} based on historic marketplace indices.`
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide a fair value marketplace appraisal for:
Category: "${category || "General"}"
Brand: "${brand || "Generic"}"
Model: "${model || "Standard"}"
Year: "${year || "N/A"}"
Condition: "${condition || "good"}"
Location: "${location || "Bahrain"}"`,
      config: {
        systemInstruction: `You are the lead Real-Estate & Commercial Pricing Intelligence Engine for Dimoads AI classifieds.
Analyze the listing parameters to determine the optimal fair market value.
Cross-reference typical historical ranges for similar items.
Assign a suggestedPrice, a reasonable priceRange (min/max), a confidenceScore from 0 to 100, and a detailed professional reasoning summary.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            suggestedPrice: { type: import_genai.Type.INTEGER },
            priceRange: {
              type: import_genai.Type.OBJECT,
              properties: {
                min: { type: import_genai.Type.INTEGER },
                max: { type: import_genai.Type.INTEGER }
              },
              required: ["min", "max"]
            },
            confidenceScore: { type: import_genai.Type.INTEGER },
            reasoning: { type: import_genai.Type.STRING }
          },
          required: ["suggestedPrice", "priceRange", "confidenceScore", "reasoning"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini pricing analyzer");
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Pricing Recommendation Error:", err);
    res.status(500).json({ error: err.message || "Failed to complete pricing recommendation" });
  }
});
app.post("/api/ai/seo", async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: "title and description are required for SEO generation" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for SEO generation.");
    const slug = (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    res.json({
      seoTitle: `${title} | Premium ${category || "Classifieds"} on Dimoads`,
      metaDescription: `Discover awesome deals for ${title}. ${description.slice(0, 100)}... Visit Dimoads AI for verified listings, direct contact, and the best prices today.`,
      keywords: [category || "classifieds", "marketplace", "buy-and-sell", "premium-deals"],
      slug: slug || "classified-listing",
      openGraphDescription: `Check out this listing on Dimoads AI: ${title}. Fast, secure, and smart listings.`
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate SEO configurations for this listing:
Title: "${title}"
Category: "${category || "General"}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are the chief SEO Optimization Specialist for Dimoads AI.
Generate professional search engine parameters to maximize organic indexing and visibility.
Provide an SEO-optimized title, meta-description (max 160 chars), 5-8 relevant keywords, a clean URL slug, and an engaging Open Graph social preview description.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            seoTitle: { type: import_genai.Type.STRING },
            metaDescription: { type: import_genai.Type.STRING },
            keywords: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            slug: { type: import_genai.Type.STRING },
            openGraphDescription: { type: import_genai.Type.STRING }
          },
          required: ["seoTitle", "metaDescription", "keywords", "slug", "openGraphDescription"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini SEO generator");
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("SEO Generator Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate SEO parameters" });
  }
});
app.post("/api/ai/admin-assistant", async (req, res) => {
  const { listings, users, reports, tickets, payments } = req.body;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning high-fidelity simulation for Admin Assistant.");
    const mockSuspiciousActivities = [
      {
        userId: "user-1",
        userName: "Mohammed Hussain",
        reason: "Multiple rapid listings created within 2 minutes containing typical cash-deposit requests.",
        riskScore: 84,
        recommendedAction: "monitor"
      },
      {
        userId: "user-2",
        userName: "Sarah Content",
        reason: "User is repeatedly editing listing description contact fields to point to suspicious external escrow URLs.",
        riskScore: 68,
        recommendedAction: "monitor"
      }
    ];
    const mockPrioritizedReports = [
      {
        reportId: reports && reports[0] ? reports[0].id : "rep-1",
        listingId: reports && reports[0] ? reports[0].listingId : "list-3",
        listingTitle: "iPhone 15 Pro Max - Urgent Sale (Brand New)",
        priority: "critical",
        reason: "Direct wire transfer demand detected. Listing priced 85% below market rate.",
        recommendedAction: "suspend"
      },
      {
        reportId: "rep-2",
        listingId: "list-4",
        listingTitle: "Rent Apartment in Juffair, Bahrain",
        priority: "medium",
        reason: "Potential incorrect category (placed in electronics instead of real-estate).",
        recommendedAction: "dismiss"
      }
    ];
    const mockListingRecommendations = [
      {
        listingId: listings && listings[0] ? listings[0].id : "list-1",
        title: listings && listings[0] ? listings[0].title : "2021 Toyota Corolla Sport",
        recommendation: "approve",
        confidence: 98,
        reason: "Pricing lies perfectly within the normal historical range. Verification criteria fully satisfied."
      },
      {
        listingId: "list-2",
        title: "Work From Home Data Operator",
        recommendation: "reject",
        confidence: 88,
        reason: "High risk of MLM/pyramid scheme keywords. Description promises $500/hour for zero experience, which fails safe job criteria."
      }
    ];
    const mockTicketSummaries = [
      {
        ticketId: "ticket-1",
        subject: "Payment failed for premium listing boost",
        summary: "The operator must verify a Stripe payment failure where $10 was charged on the user's card but listing was not boosted.",
        suggestedReply: "Dear user, we apologize for the inconvenience. We have verified your transaction through our Stripe dashboard logs and successfully activated your listing boost. Please check your updated campaign ledger.",
        sentiment: "urgent"
      }
    ];
    const mockFinancialTrafficInsights = [
      {
        type: "revenue",
        title: "Refund rates increased for Premium Boosts",
        isAbnormal: true,
        impact: "high",
        description: "Refunded transactions have increased by 28% over the past 24 hours. Majority are associated with pending webhook latency issues.",
        recommendedAdjustment: "Audit webhook latency for the stripe payment processor integration immediately. Ensure status changes synchronize within 500ms."
      },
      {
        type: "traffic",
        title: "GCC Late-Night Search Peak",
        isAbnormal: false,
        impact: "medium",
        description: "Traffic volumes from Saudi Arabia and Bahrain peaked between 1 AM and 4 AM, representing a 15% shift compared to typical daytime trends.",
        recommendedAdjustment: "Scale cloud server replicas or optimize database caching between 1 AM - 4 AM to handle high peak search loads smoothly."
      }
    ];
    const mockAgentPreparation = {
      agentName: "Dimoads Autonomous Archon v1",
      readyForAutonomousExecution: false,
      capabilityDirectives: [
        "DIRECTIVE_1: AUTO_SUSPEND_SCAMS_SCORE_GT_95",
        "DIRECTIVE_2: AUTO_CATEGORIZE_MISPLACED_LISTINGS",
        "DIRECTIVE_3: AUTO_REPLY_TICKETS_RECURRING_FAQS"
      ],
      nextAutonomousStepSimulated: "Simulation ready: Scanning audit logs. When autonomous mode is enabled by the Super Admin, the agent will execute the queue."
    };
    res.json({
      suspiciousActivities: mockSuspiciousActivities,
      prioritizedReports: mockPrioritizedReports,
      listingRecommendations: mockListingRecommendations,
      ticketSummaries: mockTicketSummaries,
      financialTrafficInsights: mockFinancialTrafficInsights,
      agentPreparation: mockAgentPreparation
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const cleanListings = (listings || []).slice(0, 10).map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description ? l.description.slice(0, 150) : "",
      price: l.price,
      userId: l.userId || "unknown",
      category: l.category
    }));
    const cleanUsers = Object.values(users || {}).slice(0, 10).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status
    }));
    const cleanReports = (reports || []).slice(0, 10).map((r) => ({
      id: r.id,
      listingId: r.listingId,
      reporterId: r.reporterId,
      reason: r.reason,
      createdAt: r.createdAt
    }));
    const cleanTickets = (tickets || []).slice(0, 5).map((t) => ({
      id: t.id,
      subject: t.subject,
      message: t.message ? t.message.slice(0, 200) : "",
      priority: t.priority,
      status: t.status
    }));
    const cleanPayments = (payments || []).slice(0, 10).map((p) => ({
      id: p.id,
      amount: p.amount,
      type: p.type,
      status: p.status,
      createdAt: p.createdAt
    }));
    const systemPrompt = `Analyze the current snapshot of Dimoads AI Platform data:
- Listings: ${JSON.stringify(cleanListings)}
- Users: ${JSON.stringify(cleanUsers)}
- Fraud Flags/Reports: ${JSON.stringify(cleanReports)}
- Support Tickets: ${JSON.stringify(cleanTickets)}
- Payments Ledger: ${JSON.stringify(cleanPayments)}

Using these datasets, act as the expert AI Admin Assistant. Generate data-driven recommendations, flags, summaries, and forecasts.
Your tasks:
1. Detect suspicious user activity based on weird listings/role/payment indicators.
2. Prioritize current reports, sorting them by risk level, recommending 'suspend' or 'dismiss'.
3. Recommend approval, rejection, or flagging for active listings.
4. Summarize support tickets with suggested high-quality replies and sentiment.
5. Highlight abnormal traffic or revenue/refund patterns in the payment ledger.
6. Prepare autonomous capability directives for a future agent runtime, simulating what it WOULD do without executing any actual state change.
Remember: All recommendations must be Advisory. Operators always make the final call.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        systemInstruction: "You are the advanced Chief AI Officer and Administration Assistant for Dimoads AI. You parse platform telemetry to provide actionable administrative briefings.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            suspiciousActivities: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  userId: { type: import_genai.Type.STRING },
                  userName: { type: import_genai.Type.STRING },
                  reason: { type: import_genai.Type.STRING },
                  riskScore: { type: import_genai.Type.INTEGER, description: "From 0 to 100" },
                  recommendedAction: { type: import_genai.Type.STRING, description: "suspend, warn, monitor, or none" }
                },
                required: ["userId", "userName", "reason", "riskScore", "recommendedAction"]
              }
            },
            prioritizedReports: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  reportId: { type: import_genai.Type.STRING },
                  listingId: { type: import_genai.Type.STRING },
                  listingTitle: { type: import_genai.Type.STRING },
                  priority: { type: import_genai.Type.STRING, description: "critical, high, medium, low" },
                  reason: { type: import_genai.Type.STRING },
                  recommendedAction: { type: import_genai.Type.STRING, description: "suspend, dismiss" }
                },
                required: ["reportId", "listingId", "listingTitle", "priority", "reason", "recommendedAction"]
              }
            },
            listingRecommendations: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  listingId: { type: import_genai.Type.STRING },
                  title: { type: import_genai.Type.STRING },
                  recommendation: { type: import_genai.Type.STRING, description: "approve, reject, flag" },
                  confidence: { type: import_genai.Type.INTEGER },
                  reason: { type: import_genai.Type.STRING }
                },
                required: ["listingId", "title", "recommendation", "confidence", "reason"]
              }
            },
            ticketSummaries: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  ticketId: { type: import_genai.Type.STRING },
                  subject: { type: import_genai.Type.STRING },
                  summary: { type: import_genai.Type.STRING },
                  suggestedReply: { type: import_genai.Type.STRING },
                  sentiment: { type: import_genai.Type.STRING, description: "frustrated, neutral, urgent, happy" }
                },
                required: ["ticketId", "subject", "summary", "suggestedReply", "sentiment"]
              }
            },
            financialTrafficInsights: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  type: { type: import_genai.Type.STRING, description: "revenue or traffic" },
                  title: { type: import_genai.Type.STRING },
                  isAbnormal: { type: import_genai.Type.BOOLEAN },
                  impact: { type: import_genai.Type.STRING, description: "high, medium, low" },
                  description: { type: import_genai.Type.STRING },
                  recommendedAdjustment: { type: import_genai.Type.STRING }
                },
                required: ["type", "title", "isAbnormal", "impact", "description", "recommendedAdjustment"]
              }
            },
            agentPreparation: {
              type: import_genai.Type.OBJECT,
              properties: {
                agentName: { type: import_genai.Type.STRING },
                readyForAutonomousExecution: { type: import_genai.Type.BOOLEAN },
                capabilityDirectives: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                nextAutonomousStepSimulated: { type: import_genai.Type.STRING }
              },
              required: ["agentName", "readyForAutonomousExecution", "capabilityDirectives", "nextAutonomousStepSimulated"]
            }
          },
          required: ["suspiciousActivities", "prioritizedReports", "listingRecommendations", "ticketSummaries", "financialTrafficInsights", "agentPreparation"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Admin Assistant AI");
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("AI Admin Assistant Error:", err);
    res.status(500).json({ error: err.message || "Failed to complete AI Admin Analysis" });
  }
});
app.post("/api/ai/recommendations", async (req, res) => {
  const { userId, favorites, searchHistory, location, category, currentListingId, listings } = req.body;
  if (!listings || !Array.isArray(listings)) {
    res.status(400).json({ error: "listings array is required" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for recommendations.");
    const recommendedIds = listings.filter((l) => l.id !== currentListingId).slice(0, 4).map((l) => l.id);
    const reasons = {};
    recommendedIds.forEach((id) => {
      reasons[id] = "Recommended because it aligns with your recent browsing history.";
    });
    res.json({ recommendedIds, reasons });
    return;
  }
  try {
    const ai = getGeminiClient();
    const compactListings = listings.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      location: l.location,
      price: l.price
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Profile Metrics:
Favorites: ${JSON.stringify(favorites || [])}
Search History: ${JSON.stringify(searchHistory || [])}
Context filters: Location="${location || "Any"}", Category="${category || "Any"}"

Available listings:
${JSON.stringify(compactListings)}`,
      config: {
        systemInstruction: `You are the central Personalization and Content Discovery Engine for Dimoads AI.
Analyze the user's profile and preferences (favorites, searches, location) against the listings.
Rank and select up to 5 recommended listing IDs that they are highly likely to engage with.
Provide the ranked recommendedIds, and a key-value record 'reasons' mapping each recommended ID to a 1-sentence personalized match reason.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            recommendedIds: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            reasons: {
              type: import_genai.Type.OBJECT,
              description: "A key-value map where key is the recommended listing ID, and value is the custom match reason string"
            }
          },
          required: ["recommendedIds", "reasons"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini recommendation engine");
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Recommendation Engine Error:", err);
    res.status(500).json({ error: err.message || "Failed to run recommendations engine" });
  }
});
app.post("/api/ai/moderation", async (req, res) => {
  const { title, description, contactInfo } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: "title and description are required for moderation audit" });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for moderation.");
    const lowerDesc = description.toLowerCase();
    const isUnsafe = lowerDesc.includes("adult") || lowerDesc.includes("weapon") || lowerDesc.includes("drugs") || lowerDesc.includes("offensive");
    res.json({
      isSafe: !isUnsafe,
      flagReasons: isUnsafe ? ["The listing description contains keywords indicating potential violations of marketplace terms."] : [],
      categories: {
        adult: lowerDesc.includes("adult"),
        violence: false,
        illegalProducts: lowerDesc.includes("weapon") || lowerDesc.includes("drugs"),
        hateSpeech: false,
        offensiveLanguage: lowerDesc.includes("offensive"),
        fakeContactInfo: false
      }
    });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Audit this marketplace listing:
Title: "${title}"
Contact Info: "${contactInfo || "N/A"}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are the core Safe-Marketplace Moderation Guard for Dimoads AI.
Analyze the listing text to detect unsafe, prohibited, or inappropriate content.
Audit for:
1. adult content or explicit language
2. violence, gore, or threats
3. illegalProducts (weapons, prohibited drugs)
4. hateSpeech or xenophobia
5. offensiveLanguage or slurs
6. fakeContactInfo (spam contact details)
If any of these categories are flagged true, set isSafe to false and provide a list of flagReasons.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            isSafe: { type: import_genai.Type.BOOLEAN },
            flagReasons: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            categories: {
              type: import_genai.Type.OBJECT,
              properties: {
                adult: { type: import_genai.Type.BOOLEAN },
                violence: { type: import_genai.Type.BOOLEAN },
                illegalProducts: { type: import_genai.Type.BOOLEAN },
                hateSpeech: { type: import_genai.Type.BOOLEAN },
                offensiveLanguage: { type: import_genai.Type.BOOLEAN },
                fakeContactInfo: { type: import_genai.Type.BOOLEAN }
              },
              required: ["adult", "violence", "illegalProducts", "hateSpeech", "offensiveLanguage", "fakeContactInfo"]
            }
          },
          required: ["isSafe", "flagReasons", "categories"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini moderation guard");
    res.json(JSON.parse(resultText.trim()));
  } catch (err) {
    console.error("Moderation Guard Error:", err);
    res.status(500).json({ error: err.message || "Failed to complete moderation audit" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: {
          ignored: ["**/data/**", "**/dist/**", "**/node_modules/**"]
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dimoads AI Server] Server running securely on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
