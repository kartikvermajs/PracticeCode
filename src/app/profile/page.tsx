"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Camera,
  Flame,
  CheckCircle2,
  Save,
  LogOut,
  Mail,
  Link as LinkIcon,
  Upload,
  Cloud,
  Loader2,
  AlertCircle,
  ExternalLink,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const { user, streak, updateProfile, refreshUser, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "DSA Revision & Problem Solving");
      setImage(user.image || PRESET_AVATARS[0]);
    }
  }, [user]);

  const isCloudinaryImage = image?.includes("res.cloudinary.com");

  // Handle Cloudinary file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be smaller than 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploadingCloudinary(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image to Cloudinary.");
      }

      // Update state with Cloudinary URL
      setImage(data.url);
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError(err.message || "Failed to upload to Cloudinary. Please try again.");
    } finally {
      setIsUploadingCloudinary(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({ name, bio, image });
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Hidden File Input for Cloudinary Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Profile &amp; Account
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Manage your personal revision identity, streak status, and avatar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your profile information and avatar have been saved successfully!</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Profile Overview Card with Streak */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar Preview with Camera Action */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md ring-4 ring-blue-50 bg-slate-100 flex items-center justify-center relative">
              {isUploadingCloudinary ? (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading</span>
                </div>
              ) : image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold">
                  {name ? name.charAt(0).toUpperCase() : "K"}
                </div>
              )}
            </div>

            {/* Quick Upload Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCloudinary}
              title="Upload new image to Cloudinary"
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-blue-400"
            >
              {isUploadingCloudinary ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {name || "Kartik"}
              </h2>
              {isCloudinaryImage ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Cloud className="w-3 h-3 text-indigo-500" />
                  <span>Cloudinary Icon</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  Active Member
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email || "kartik@coderev.dev"}</span>
            </p>
            <p className="text-xs text-slate-600 pt-1 font-medium">
              {bio || "DSA Revision & Problem Solving"}
            </p>
          </div>
        </div>

        {/* Real Streak Indicator Badge */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-200/80 flex items-center gap-4 shrink-0 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-2xs">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {streak}
              </span>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                Day{streak === 1 ? "" : "s"} Streak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Practice today to keep your streak alive!
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Profile Avatar (Cloudinary Custom Upload + Presets) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Profile Icon
              </h3>
            </div>
            {isCloudinaryImage && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hosted on Cloudinary</span>
              </span>
            )}
          </div>

          {/* Custom Cloudinary Upload Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Upload Custom Profile Icon
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer text-center group flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isUploadingCloudinary ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploadingCloudinary
                    ? "Uploading image to Cloudinary..."
                    : "Click to choose a custom image from your device"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stored securely in Cloudinary account (djcggiop6) · PNG, JPG, WEBP, or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Preset Avatars */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Or Choose from Presets
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((presetUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImage(presetUrl)}
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                    image === presetUrl
                      ? "ring-4 ring-blue-500 border-white scale-105"
                      : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={presetUrl}
                    alt={`Avatar option ${idx + 1}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                  {image === presetUrl && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Icon URL
              </label>
              <div className="relative flex items-center">
                <LinkIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Identity Details */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={user?.email || "kartik@coderev.dev"}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Email is managed securely by your account credentials.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Bio / Revision Focus
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="e.g. Preparing for SDE-2 interviews · Mastering Arrays & Graphs"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
