"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "../ui/Card";
import toast from "react-hot-toast";

interface MobileApp {
  _id: string;
  name: string;
  appLogo?: string;
  appText?: string;
  appUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const AppSettingsView: React.FC = () => {
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<MobileApp | null>(null);

  // Form states
  const [appName, setAppName] = useState<string>("");
  const [appText, setAppText] = useState<string>("");
  const [appUrl, setAppUrl] = useState<string>("");
  const [appLogo, setAppLogo] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all apps
  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/apps");
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
      } else {
        toast.error("Failed to load apps list.");
      }
    } catch (err) {
      console.error("Error fetching apps:", err);
      toast.error("Network error while fetching apps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Open form in Create mode
  const handleOpenAdd = () => {
    setEditingApp(null);
    setAppName("");
    setAppText("");
    setAppUrl("");
    setAppLogo("");
    setPreviewUrl("");
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  // Open form in Edit mode
  const handleOpenEdit = (app: MobileApp) => {
    setEditingApp(app);
    setAppName(app.name);
    setAppText(app.appText || "");
    setAppUrl(app.appUrl || "");
    setAppLogo(app.appLogo || "");
    setPreviewUrl(app.appLogo || "");
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  // Delete an app
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the app "${name}"?`)) return;
    try {
      const res = await fetch(`/api/apps?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`App "${name}" successfully deleted.`);
        fetchApps();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete app.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WebP)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WebP)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Form submit (Add or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      toast.error("App Name is required.");
      return;
    }

    setSaving(true);
    let logoUrl = appLogo;

    try {
      // 1. If a new logo file was selected, upload it to AWS S3 first
      if (selectedFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Failed to upload logo image to S3.");
        }

        const uploadResult = await uploadRes.json();
        logoUrl = uploadResult.url;
        setUploading(false);
      }

      // 2. Prepare payload
      const payload: any = {
        name: appName.trim(),
        appLogo: logoUrl,
        appText: appText.trim(),
        appUrl: appUrl.trim(),
      };

      let saveRes;
      if (editingApp) {
        // Edit mode (PUT)
        payload.id = editingApp._id;
        saveRes = await fetch("/api/apps", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Add mode (POST)
        saveRes = await fetch("/api/apps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || "Failed to save app configuration.");
      }

      toast.success(editingApp ? "App settings updated!" : "App successfully created!");
      setIsFormOpen(false);
      fetchApps();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-2 flex-1 pb-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 animate-slide-up select-none">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            {isFormOpen ? (editingApp ? "Edit App Configuration" : "Register New Mobile App") : "Mobile Apps Directory"}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {isFormOpen 
              ? "Fill out app details, upload icons directly to AWS, and save settings." 
              : "Manage and configure settings for all your mobile client applications."}
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New App</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#5113C2] border-r-4 border-transparent" />
          <span className="text-xs text-slate-450 font-semibold">Loading apps directory...</span>
        </div>
      ) : isFormOpen ? (
        /* Form view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Left Preview (Col Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="flex flex-col gap-5">
              <span className="text-[11px] font-bold text-[#7B3FE4] uppercase tracking-wider block">
                Live Preview
              </span>
              
              {/* Preview Mockup Card */}
              <div className="bg-gradient-to-br from-[#7B3FE4] to-[#5113C2] text-white rounded-2xl p-5 relative overflow-hidden shadow-lg select-none min-h-[160px] flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

                <div className="flex items-center gap-3.5">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="App Logo Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-white/10 shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
                      {appName ? appName.substring(0, 2).toUpperCase() : "AP"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black tracking-wider uppercase opacity-75 truncate">
                      {appName || "App Name"}
                    </h4>
                    <p className="text-[10px] text-white/90 font-medium truncate mt-0.5">
                      {appText || "No promo text entered yet"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 z-10">
                  <span className="text-[8px] font-bold bg-white/15 px-2 py-0.5 rounded border border-white/10 truncate max-w-[150px]">
                    {appUrl ? appUrl.replace(/^https?:\/\/(www\.)?/, "") : "No download URL"}
                  </span>
                  <a
                    href={appUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[9px] font-black py-1.5 px-3 rounded-lg shadow-sm transition-all text-[#5113C2] bg-[#F5C518] hover:bg-[#E5B612] ${!appUrl ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    GET APP
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Form Fields (Col Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="p-6">
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                {/* Logo Dragzone */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wide">
                    App Icon / Logo
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-slate-200 hover:border-[#7B3FE4] bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-3 relative group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-150">
                        <img
                          src={previewUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold uppercase">
                          Change
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#7B3FE4] transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-600">
                        {selectedFile ? selectedFile.name : "Upload app logo / icon"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Drag and drop or click to browse. Max 2MB (PNG, JPG, WebP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* App Name Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wide">
                    App Name / Title
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. UPSC Civil Services Practice"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B3FE4] transition-all"
                    required
                  />
                </div>

                {/* App Text Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wide">
                    Promo Text / Description
                  </label>
                  <input
                    type="text"
                    value={appText}
                    onChange={(e) => setAppText(e.target.value)}
                    placeholder="e.g. Master your preparation with 20+ years solved papers."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B3FE4] transition-all"
                  />
                </div>

                {/* App Url Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wide">
                    Download Store URL
                  </label>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B3FE4] transition-all"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="bg-[#5113C2] hover:bg-[#42169B] disabled:bg-[#5113C2]/50 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white border-r-2 border-transparent" />
                        <span>Uploading Image...</span>
                      </>
                    ) : saving ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white border-r-2 border-transparent" />
                        <span>Saving App...</span>
                      </>
                    ) : (
                      <span>{editingApp ? "Save Updates" : "Register App"}</span>
                    )}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      ) : apps.length === 0 ? (
        /* Empty state */
        <Card className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7B3FE4]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">No Apps Registered</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              You haven't set up any mobile client applications yet. Click below to add one.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-1"
          >
            Add First App
          </button>
        </Card>
      ) : (
        /* Grid of apps */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {apps.map((app) => (
            <Card key={app._id} className="relative flex flex-col justify-between min-h-[220px] p-5 group hover:shadow-md">
              <div className="flex flex-col gap-4">
                {/* Header detail */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {app.appLogo ? (
                      <img
                        src={app.appLogo}
                        alt={app.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center font-bold text-[#7B3FE4] shrink-0 shadow-sm text-sm uppercase">
                        {app.name.substring(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 tracking-wide truncate">
                        {app.name}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Added {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Popover (Edit, Delete) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(app)}
                      className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit App Details"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(app._id, app.name)}
                      className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete App"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Promo Text */}
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed min-h-[32px] line-clamp-2">
                  {app.appText || <span className="italic text-slate-350 font-normal">No promotional text configured.</span>}
                </p>
              </div>

              {/* Bottom detail links */}
              <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between gap-3 text-[10px]">
                <span 
                  className="font-bold text-slate-400 truncate max-w-[170px]" 
                  title={app.appUrl || "No download URL set"}
                >
                  {app.appUrl ? app.appUrl.replace(/^https?:\/\/(www\.)?/, "") : "No download link"}
                </span>
                <a
                  href={app.appUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[9px] font-black py-1.5 px-3 rounded-lg text-white bg-[#7B3FE4] hover:bg-[#5113C2] transition-all shadow-sm ${!app.appUrl ? "opacity-35 pointer-events-none" : ""}`}
                >
                  GET URL
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
