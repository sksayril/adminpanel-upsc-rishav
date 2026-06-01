"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/Card";
import toast, { Toaster } from "react-hot-toast";

// Dashboard original components
import { HorizontalBarChart } from "@/components/dashboard/HorizontalBarChart";
import { RadialProgressRing } from "@/components/dashboard/RadialProgressRing";
import { AccordionList } from "@/components/dashboard/AccordionList";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { FinancialMetricCard } from "@/components/dashboard/FinancialMetricCard";
import { VerticalBarChart } from "@/components/dashboard/VerticalBarChart";
import { VolumeDensityChart } from "@/components/dashboard/VolumeDensityChart";
import { SlidersCard } from "@/components/dashboard/SlidersCard";
import { ProgressListCard } from "@/components/dashboard/ProgressListCard";
import { AppSettingsView } from "@/components/dashboard/AppSettingsView";
import { getCategoryYearOptions } from "@/lib/categoryYears";

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- Category and Document Upload States ---
  const [catalogTree, setCatalogTree] = useState<any[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  // Wizard flow states
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardMainMainId, setWizardMainMainId] = useState("");
  const [wizardCatId, setWizardCatId] = useState("");
  const [wizardSubId, setWizardSubId] = useState("");
  const [wizardSubSubId, setWizardSubSubId] = useState("");

  // Wizard input text fields
  const [newMainMainName, setNewMainMainName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatYear, setNewCatYear] = useState("2026");
  const [newCatYearMode, setNewCatYearMode] = useState<"text" | "year">("year");
  const [renameCatYearMode, setRenameCatYearMode] = useState<"text" | "year">("text");
  const [newSubName, setNewSubName] = useState("");
  const [newSubSubName, setNewSubSubName] = useState("");

  // Rename controlled inputs
  const [renameMMName, setRenameMMName] = useState("");
  const [renameCatName, setRenameCatName] = useState("");
  const [renameCatYear, setRenameCatYear] = useState("");
  const [renameSubName, setRenameSubName] = useState("");
  const [renameSubSubName, setRenameSubSubName] = useState("");

  // PDF Document Uploader Form
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [lastUploadedTitle, setLastUploadedTitle] = useState<string>("");

  const clearCategoryDraft = () => {
    setNewCatName("");
    setNewCatYear("2026");
    setNewCatYearMode("year");
  };

  const clearSubcategoryDraft = () => {
    setNewSubName("");
  };

  const clearSubSubcategoryDraft = () => {
    setNewSubSubName("");
  };

  const clearAllWizardDrafts = () => {
    setNewMainMainName("");
    clearCategoryDraft();
    clearSubcategoryDraft();
    clearSubSubcategoryDraft();
  };

  const advanceWizardStep = () => {
    if (wizardStep === 1) setNewMainMainName("");
    if (wizardStep === 2) clearCategoryDraft();
    if (wizardStep === 3) clearSubcategoryDraft();
    if (wizardStep === 4) clearSubSubcategoryDraft();
    setWizardStep(wizardStep + 1);
  };

  // Fetch hierarchical catalog tree
  const fetchCatalogTree = async () => {
    try {
      setLoadingTree(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCatalogTree(data.tree || []);
      }
    } catch (err) {
      console.error("Error fetching catalog tree", err);
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchCatalogTree();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Helper arrays for Wizard cascading options
  const wizardCategories = wizardMainMainId
    ? catalogTree.find((mm: any) => mm._id === wizardMainMainId)?.categories || []
    : [];

  const activeCategoryYear = wizardCatId
    ? wizardCategories.find((c: any) => c._id === wizardCatId)?.year || ""
    : "";

  useEffect(() => {
    if (activeCategoryYear) {
      const isYearOnly = /^\d{4}$/.test(activeCategoryYear);
      setRenameCatYearMode(isYearOnly ? "year" : "text");
      setRenameCatYear(activeCategoryYear);
    }
  }, [activeCategoryYear]);

  // Sync rename inputs when wizard selection changes
  useEffect(() => {
    if (wizardMainMainId) {
      const mm = catalogTree.find((m: any) => m._id === wizardMainMainId);
      setRenameMMName(mm?.name || "");
    } else {
      setRenameMMName("");
    }
  }, [wizardMainMainId, catalogTree]);

  useEffect(() => {
    if (wizardCatId) {
      const cats = wizardMainMainId
        ? catalogTree.find((mm: any) => mm._id === wizardMainMainId)?.categories || []
        : [];
      const cat = cats.find((c: any) => c._id === wizardCatId);
      setRenameCatName(cat?.name || "");
      setRenameCatYear(cat?.year || "");
    } else {
      setRenameCatName("");
      setRenameCatYear("");
    }
  }, [wizardCatId, catalogTree]);

  useEffect(() => {
    if (wizardSubId) {
      const cats = wizardMainMainId
        ? catalogTree.find((mm: any) => mm._id === wizardMainMainId)?.categories || []
        : [];
      const cat = cats.find((c: any) => c._id === wizardCatId);
      const subs = cat?.subcategories || [];
      const sub = subs.find((s: any) => s._id === wizardSubId);
      setRenameSubName(sub?.name || "");
    } else {
      setRenameSubName("");
    }
  }, [wizardSubId, catalogTree]);

  useEffect(() => {
    if (wizardSubSubId) {
      const cats = wizardMainMainId
        ? catalogTree.find((mm: any) => mm._id === wizardMainMainId)?.categories || []
        : [];
      const cat = cats.find((c: any) => c._id === wizardCatId);
      const subs = cat?.subcategories || [];
      const sub = subs.find((s: any) => s._id === wizardSubId);
      const subSubs = sub?.subSubcategories || [];
      const subSub = subSubs.find((ss: any) => ss._id === wizardSubSubId);
      setRenameSubSubName(subSub?.name || "");
    } else {
      setRenameSubSubName("");
    }
  }, [wizardSubSubId, catalogTree]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3FC]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#5113C2] border-r-4 border-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3FC] text-slate-500 font-bold text-sm select-none">
        Redirecting to login...
      </div>
    );
  }

  // --- API Action Handlers ---

  // 1. Rename Handlers
  const handleRenameMainMainCategory = async (id: string, name: string) => {
    if (!name) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/mainmaincategories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Main Main Category renamed to "${name}"`);
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to rename Main Main Category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameCategory = async (id: string, name: string, year: string) => {
    if (!name || !year) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, year }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Category renamed to "${name} (${year})"`);
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to rename category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameSubcategory = async (id: string, name: string) => {
    if (!name) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subcategories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Subcategory renamed to "${name}"`);
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to rename subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameSubSubcategory = async (id: string, name: string) => {
    if (!name) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subsubcategories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sub-subcategory renamed to "${name}"`);
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to rename sub-subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameDocument = async (id: string, title: string, description?: string) => {
    if (!title) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, description }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Document renamed to "${title}"`);
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to rename document");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Delete Handlers (MongoDB only cascade delete, S3 files preserved)
  const handleDeleteMainMainCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete this Main Main Category and ALL associated categories, subcategories, sub-subcategories, and documents from MongoDB (your PDFs in S3 will be preserved).")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/mainmaincategories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Main Main Category successfully deleted from MongoDB.");
        if (wizardMainMainId === id) {
          setWizardMainMainId("");
          setWizardCatId("");
          setWizardSubId("");
          setWizardSubSubId("");
          setWizardStep(1);
        }
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to delete Main Main Category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete this Category and ALL associated subcategories, sub-subcategories, and documents from MongoDB (your PDFs in S3 will be preserved).")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category successfully deleted from MongoDB.");
        if (wizardCatId === id) {
          setWizardCatId("");
          setWizardSubId("");
          setWizardSubSubId("");
          setWizardStep(Math.min(wizardStep, 2));
        }
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete this Subcategory and all its child sub-subcategories and documents from MongoDB.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subcategories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Subcategory successfully deleted from MongoDB.");
        if (wizardSubId === id) {
          setWizardSubId("");
          setWizardSubSubId("");
          setWizardStep(Math.min(wizardStep, 3));
        }
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to delete subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubSubcategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete this Sub-subcategory and its documents from MongoDB.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subsubcategories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sub-subcategory successfully deleted from MongoDB.");
        if (wizardSubSubId === id) {
          setWizardSubSubId("");
          setWizardStep(Math.min(wizardStep, 4));
        }
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to delete sub-subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure? This will delete this document registry from MongoDB. The file on S3 will not be deleted.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Document deleted from MongoDB (PDF left intact on S3).");
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to delete document");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Wizard Creator Handlers
  const handleWizardCreateMainMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep !== 1) return;
    if (!newMainMainName) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/mainmaincategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMainMainName }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Main Main Category "${newMainMainName}" created!`);
        setWizardMainMainId(data.mainMainCategory._id);
        setNewMainMainName("");
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to create Main Main Category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWizardCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep !== 2) return;
    if (!newCatName.trim() || !wizardMainMainId) return;
    // Year mode: must have a valid year selected; Text mode: must have non-empty text
    if (newCatYearMode === "year" && !newCatYear) return;
    if (newCatYearMode === "text" && !newCatYear.trim()) {
      toast.error("Please enter a label text for the category.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          year: newCatYear.trim(),
          mainMainCategoryId: wizardMainMainId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Category "${newCatName.trim()} (${newCatYear.trim()})" created!`);
        setWizardCatId(data.category._id);
        clearCategoryDraft();
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWizardCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep !== 3) return;
    if (!newSubName.trim() || !wizardCatId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubName.trim(), categoryId: wizardCatId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Subcategory "${newSubName.trim()}" created!`);
        setWizardSubId(data.subcategory._id);
        clearSubcategoryDraft();
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to create subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWizardCreateSubSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep !== 4) return;
    if (!newSubSubName.trim() || !wizardSubId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subsubcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubSubName.trim(), subcategoryId: wizardSubId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sub-subcategory "${newSubSubName.trim()}" created!`);
        setWizardSubSubId(data.subSubcategory._id);
        clearSubSubcategoryDraft();
        fetchCatalogTree();
      } else {
        toast.error(data.error || "Failed to create sub-subcategory");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };



  const wizardSubcategories = wizardCatId
    ? wizardCategories.find((c: any) => c._id === wizardCatId)?.subcategories || []
    : [];

  const wizardSubSubcategories = wizardSubId
    ? wizardSubcategories.find((s: any) => s._id === wizardSubId)?.subSubcategories || []
    : [];

  const wizardDocuments = wizardSubSubId
    ? wizardSubSubcategories.find((ss: any) => ss._id === wizardSubSubId)?.documents || []
    : [];

  const renderContent = () => {
    switch (activeTab) {
      case "app-manager-upsc":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 flex-1 pb-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 animate-slide-up select-none">
            
            {/* Tree Catalog List Panel (Col Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="flex flex-col min-h-[480px] justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-3 mb-4">
                    <span className="text-[11px] font-bold text-[#7B3FE4] uppercase tracking-wider">Catalog Tree</span>
                    <button 
                      onClick={fetchCatalogTree}
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>

                  {loadingTree ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#5113C2] border-r-2 border-transparent" />
                    </div>
                  ) : catalogTree.length === 0 ? (
                    <div className="text-center py-20 text-xs text-slate-400 font-medium">
                      No main main categories created yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {catalogTree.map((mm) => (
                        <details key={mm._id} className="group/mm">
                          <summary className="flex items-center justify-between cursor-pointer py-1 text-xs font-bold text-slate-700 hover:text-slate-900 list-none">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-md bg-[#7B3FE4]/20 border border-[#7B3FE4]/50 flex items-center justify-center font-bold text-[8px] text-[#7B3FE4] flex-shrink-0">MM</span>
                              <span className="truncate">{mm.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/mm:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  const newName = prompt("Rename Main Main Category name:", mm.name);
                                  if (newName && newName.trim()) {
                                    handleRenameMainMainCategory(mm._id, newName.trim());
                                  }
                                }}
                                className="text-slate-400 hover:text-[#5113C2] p-0.5"
                                title="Rename"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMainMainCategory(mm._id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Delete"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>

                            <svg className="w-3.5 h-3.5 transition-transform group-open/mm:rotate-90 text-slate-400 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </summary>

                          <div className="pl-4 border-l border-slate-100/80 flex flex-col gap-2.5 mt-1.5 ml-2.5">
                            {mm.categories && mm.categories.map((cat: any) => (
                              <details key={cat._id} className="group/cat">
                                <summary className="flex items-center justify-between cursor-pointer py-1 text-xs font-bold text-slate-650 hover:text-slate-850 list-none">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-md bg-[#FF6B6B]/20 border border-[#FF6B6B]/50 flex items-center justify-center font-bold text-[8px] text-[#FF6B6B] flex-shrink-0">C</span>
                                    <span className="truncate">{cat.name} ({cat.year})</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover/cat:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => {
                                        const newName = prompt("Rename category name:", cat.name);
                                        if (newName && newName.trim()) {
                                          const newYear = prompt("Rename category year:", cat.year);
                                          if (newYear && newYear.trim()) {
                                            handleRenameCategory(cat._id, newName.trim(), newYear.trim());
                                          }
                                        }
                                      }}
                                      className="text-slate-400 hover:text-[#5113C2] p-0.5"
                                      title="Rename"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(cat._id)}
                                      className="text-slate-400 hover:text-rose-600 p-0.5"
                                      title="Delete"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>

                                  <svg className="w-3.5 h-3.5 transition-transform group-open/cat:rotate-90 text-slate-400 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </summary>

                                <div className="pl-4 border-l border-slate-100/80 flex flex-col gap-2.5 mt-1.5 ml-2.5">
                                  {cat.subcategories && cat.subcategories.map((sub: any) => (
                                    <details key={sub._id} className="group/sub">
                                      <summary className="flex items-center justify-between cursor-pointer py-0.5 text-[11px] font-bold text-slate-600 hover:text-slate-850 list-none">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="w-2.5 h-2.5 rounded-md bg-[#05C287]/20 border border-[#05C287]/50 flex items-center justify-center font-bold text-[8px] text-[#05C287] flex-shrink-0">S</span>
                                          <span className="truncate">{sub.name}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover/sub:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => {
                                              const newName = prompt("Rename subcategory:", sub.name);
                                              if (newName && newName.trim()) handleRenameSubcategory(sub._id, newName.trim());
                                            }}
                                            className="text-slate-400 hover:text-[#5113C2] p-0.5"
                                            title="Rename"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubcategory(sub._id)}
                                            className="text-slate-400 hover:text-rose-600 p-0.5"
                                            title="Delete"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                          </button>
                                        </div>

                                        <svg className="w-3.5 h-3.5 transition-transform group-open/sub:rotate-90 text-slate-400 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                      </summary>

                                      <div className="pl-4 border-l border-slate-100/80 flex flex-col gap-2 mt-1.5 ml-2">
                                        {sub.subSubcategories && sub.subSubcategories.map((subSub: any) => (
                                          <details key={subSub._id} className="group/subsub">
                                            <summary className="flex items-center justify-between cursor-pointer py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 list-none">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-md bg-[#F5C518]/20 border border-[#F5C518]/50 flex items-center justify-center font-bold text-[8px] text-amber-600 flex-shrink-0">SS</span>
                                                <span className="truncate">{subSub.name}</span>
                                              </div>
                                              
                                              <div className="flex items-center gap-1.5 opacity-0 group-hover/subsub:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                  onClick={() => {
                                                    const newName = prompt("Rename sub-subcategory:", subSub.name);
                                                    if (newName && newName.trim()) handleRenameSubSubcategory(subSub._id, newName.trim());
                                                  }}
                                                  className="text-slate-400 hover:text-[#5113C2] p-0.5"
                                                  title="Rename"
                                                >
                                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteSubSubcategory(subSub._id)}
                                                  className="text-slate-400 hover:text-rose-600 p-0.5"
                                                  title="Delete"
                                                >
                                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                              </div>

                                              <svg className="w-3 h-3 transition-transform group-open/subsub:rotate-90 text-slate-400 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                            </summary>

                                            <div className="pl-4 border-l border-slate-100/80 flex flex-col gap-1.5 mt-1 ml-2">
                                              {subSub.documents && subSub.documents.map((doc: any) => (
                                                <div key={doc._id} className="flex items-center justify-between gap-2 py-1 group/doc hover:bg-slate-50/50 rounded-lg px-2 -mx-2">
                                                  <a
                                                    href={doc.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[9px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors truncate flex-1 min-w-0"
                                                  >
                                                    <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="truncate">{doc.title}</span>
                                                  </a>

                                                  <div className="flex items-center gap-1.5 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => {
                                                        const newTitle = prompt("Rename Document Title:", doc.title);
                                                        if (newTitle && newTitle.trim()) handleRenameDocument(doc._id, newTitle.trim(), doc.description);
                                                      }}
                                                      className="text-slate-400 hover:text-[#5113C2] p-0.5"
                                                      title="Rename"
                                                    >
                                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteDocument(doc._id)}
                                                      className="text-slate-400 hover:text-rose-600 p-0.5"
                                                      title="Delete"
                                                    >
                                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                              {(!subSub.documents || subSub.documents.length === 0) && (
                                                <span className="text-[9px] text-slate-300 italic pl-6 py-0.5">No PDFs uploaded</span>
                                              )}
                                            </div>
                                          </details>
                                        ))}
                                        {(!sub.subSubcategories || sub.subSubcategories.length === 0) && (
                                          <span className="text-[9px] text-slate-300 italic pl-6 py-0.5">No Sub-subcategories</span>
                                        )}
                                      </div>
                                    </details>
                                  ))}
                                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                                    <span className="text-[9px] text-slate-300 italic pl-6 py-0.5">No Subcategories</span>
                                  )}
                                </div>
                              </details>
                            ))}
                            {(!mm.categories || mm.categories.length === 0) && (
                              <span className="text-[9px] text-slate-300 italic pl-6 py-0.5">No Categories</span>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-[9.5px] text-slate-400 font-bold border-t border-slate-50 pt-3 select-none">
                  Structure: MM = Main Main, C = Category, S = Sub, SS = Sub-Sub
                </div>
              </Card>
            </div>

            {/* Guided Category Wizard Panel (Col Span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="flex flex-col p-6 min-h-[480px] justify-between">
                <div>
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <span className="text-[11px] font-bold text-[#7B3FE4] uppercase tracking-wider">Step-by-Step Category Wizard</span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Step {wizardStep} of 5</span>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex items-center justify-between mb-8 relative px-2">
                    <div className="absolute left-6 right-6 top-1/2 h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
                    
                    <button 
                      onClick={() => wizardStep > 1 && setWizardStep(1)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border z-10 transition-all cursor-pointer ${
                        wizardStep >= 1
                          ? "bg-[#5113C2] text-white border-[#5113C2] shadow-[0_0_12px_rgba(81,19,194,0.3)]"
                          : "bg-white text-slate-400 border-slate-200"
                      }`}
                    >
                      1
                    </button>
                    
                    <button 
                      onClick={() => wizardMainMainId && setWizardStep(2)}
                      disabled={!wizardMainMainId}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border z-10 transition-all ${
                        wizardStep >= 2
                          ? "bg-[#5113C2] text-white border-[#5113C2] shadow-[0_0_12px_rgba(81,19,194,0.3)] cursor-pointer"
                          : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      2
                    </button>

                    <button 
                      onClick={() => wizardCatId && setWizardStep(3)}
                      disabled={!wizardCatId}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border z-10 transition-all ${
                        wizardStep >= 3
                          ? "bg-[#5113C2] text-white border-[#5113C2] shadow-[0_0_12px_rgba(81,19,194,0.3)] cursor-pointer"
                          : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      3
                    </button>

                    <button 
                      onClick={() => wizardSubId && setWizardStep(4)}
                      disabled={!wizardSubId}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border z-10 transition-all ${
                        wizardStep >= 4
                          ? "bg-[#5113C2] text-white border-[#5113C2] shadow-[0_0_12px_rgba(81,19,194,0.3)] cursor-pointer"
                          : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      4
                    </button>

                    <button 
                      onClick={() => wizardSubSubId && setWizardStep(5)}
                      disabled={!wizardSubSubId}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border z-10 transition-all ${
                        wizardStep >= 5
                          ? "bg-[#5113C2] text-white border-[#5113C2] shadow-[0_0_12px_rgba(81,19,194,0.3)] cursor-pointer"
                          : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      5
                    </button>
                  </div>

                  {/* Step 1 Content: Main Main Category Selection */}
                  {wizardStep === 1 && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Step 1: Main Main Category Selection</h3>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Select an existing Main Main Category to proceed or create a new one below.</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Selector */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Main Main Category</label>
                          <select
                            value={wizardMainMainId}
                            onChange={(e) => {
                              setWizardMainMainId(e.target.value);
                              setWizardCatId("");
                              setWizardSubId("");
                              setWizardSubSubId("");
                              clearCategoryDraft();
                              clearSubcategoryDraft();
                              clearSubSubcategoryDraft();
                            }}
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2] cursor-pointer"
                          >
                            <option value="">-- Choose Main Main Category --</option>
                            {catalogTree.map((mm) => (
                              <option key={mm._id} value={mm._id}>{mm.name}</option>
                            ))}
                          </select>

                          {wizardMainMainId && (
                            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 mt-2 animate-slide-up">
                              <span className="text-[9px] font-extrabold text-[#7B3FE4] uppercase tracking-wider">Rename / Delete Active Main Main Category</span>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  placeholder="Rename MM category"
                                  value={renameMMName}
                                  onChange={(e) => setRenameMMName(e.target.value)}
                                  className="w-full text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRenameMainMainCategory(wizardMainMainId, renameMMName)}
                                    className="flex-1 bg-[#5113C2] hover:bg-[#42169B] text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMainMainCategory(wizardMainMainId)}
                                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] bg-slate-100/80 hidden md:block" />

                        {/* Creator */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Or Create New Main Main Category</label>
                          <form onSubmit={handleWizardCreateMainMainCategory} className="flex flex-col gap-2" autoComplete="off">
                            <input
                              type="text"
                              placeholder="Main Main Category name (e.g. UPSC, NCERT)"
                              value={newMainMainName}
                              onChange={(e) => setNewMainMainName(e.target.value)}
                              autoComplete="off"
                              disabled={actionLoading}
                              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2]"
                            />
                            <button
                              type="submit"
                              disabled={actionLoading || !newMainMainName}
                              className="w-full bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Create
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Content: Category Selection */}
                  {wizardStep === 2 && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                      <div className="bg-[#5113C2]/5 border border-[#5113C2]/10 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-extrabold text-[#7B3FE4] uppercase">
                        <span>Active Main Main Category:</span>
                        <span className="bg-[#7B3FE4] text-white px-2 py-0.5 rounded-md">{catalogTree.find(m => m._id === wizardMainMainId)?.name}</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Step 2: Main Category Selection</h3>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Select an existing Main Category to proceed or create a new one below.</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Selector */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Category</label>
                          <select
                            value={wizardCatId}
                            onChange={(e) => {
                              setWizardCatId(e.target.value);
                              setWizardSubId("");
                              setWizardSubSubId("");
                              clearCategoryDraft();
                            }}
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2] cursor-pointer"
                          >
                            <option value="">-- Choose Category --</option>
                            {wizardCategories.map((c: any) => (
                              <option key={c._id} value={c._id}>{c.name} ({c.year})</option>
                            ))}
                          </select>

                          {wizardCatId && (
                            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 mt-2 animate-slide-up">
                              <span className="text-[9px] font-extrabold text-[#7B3FE4] uppercase tracking-wider">Rename / Delete Active Category</span>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  placeholder="Rename category"
                                  value={renameCatName}
                                  onChange={(e) => setRenameCatName(e.target.value)}
                                  className="w-full text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                />
                                
                                <div className="flex items-center gap-3 my-0.5 px-1">
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Rename Mode:</span>
                                  {/* Text radio — always enabled */}
                                  <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-700">
                                    <input
                                      type="radio"
                                      name="renameCatYearMode"
                                      value="text"
                                      checked={renameCatYearMode === "text"}
                                      onChange={() => setRenameCatYearMode("text")}
                                      className="accent-[#5113C2] cursor-pointer"
                                    />
                                    Text
                                  </label>
                                  {/* Year radio — always enabled */}
                                  <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-700">
                                    <input
                                      type="radio"
                                      name="renameCatYearMode"
                                      value="year"
                                      checked={renameCatYearMode === "year"}
                                      onChange={() => {
                                        setRenameCatYearMode("year");
                                        if (!/^\d{4}$/.test(renameCatYear)) setRenameCatYear("2026");
                                      }}
                                      className="accent-[#5113C2] cursor-pointer"
                                    />
                                    Year
                                  </label>
                                </div>

                                {renameCatYearMode === "text" ? (
                                  <input
                                    type="text"
                                    placeholder="Rename year or text"
                                    value={renameCatYear}
                                    onChange={(e) => setRenameCatYear(e.target.value)}
                                    className="w-full text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                  />
                                ) : (
                                  <select
                                    value={/^\d{4}$/.test(renameCatYear) ? renameCatYear : "2026"}
                                    onChange={(e) => setRenameCatYear(e.target.value)}
                                    className="w-full text-[11px] font-bold text-slate-750 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2] cursor-pointer"
                                  >
                                    {getCategoryYearOptions().map((yr) => (
                                      <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                  </select>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRenameCategory(wizardCatId, renameCatName, renameCatYear)}
                                    className="flex-1 bg-[#5113C2] hover:bg-[#42169B] text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(wizardCatId)}
                                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] bg-slate-100/80 hidden md:block" />

                        {/* Creator */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Or Create New Category</label>
                          <form onSubmit={handleWizardCreateCategory} className="flex flex-col gap-2" autoComplete="off">
                            <input
                              type="text"
                              placeholder="Category name (e.g. GS Prelims)"
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              autoComplete="off"
                              disabled={actionLoading}
                              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2]"
                            />
                            
                            <div className="flex items-center gap-4 my-1 px-1">
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Input Mode:</span>
                              {/* Text radio — always enabled, free to switch */}
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                                <input
                                  type="radio"
                                  name="newCatYearMode"
                                  value="text"
                                  checked={newCatYearMode === "text"}
                                  onChange={() => {
                                    if (newCatYearMode !== "text") {
                                      setNewCatYearMode("text");
                                      setNewCatYear(""); // clear so user types fresh
                                    }
                                  }}
                                  className="accent-[#5113C2] cursor-pointer"
                                />
                                Text
                              </label>
                              {/* Year radio — always enabled */}
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                                <input
                                  type="radio"
                                  name="newCatYearMode"
                                  value="year"
                                  checked={newCatYearMode === "year"}
                                  onChange={() => {
                                    if (newCatYearMode !== "year") {
                                      setNewCatYearMode("year");
                                      // carry over valid year, else default to 2026
                                      if (!/^\d{4}$/.test(newCatYear)) setNewCatYear("2026");
                                    }
                                  }}
                                  className="accent-[#5113C2] cursor-pointer"
                                />
                                Year
                              </label>
                            </div>

                            {newCatYearMode === "text" ? (
                              <input
                                type="text"
                                placeholder="Enter any label text (e.g. Phase 1, Prelims)"
                                value={newCatYear}
                                onChange={(e) => setNewCatYear(e.target.value)}
                                autoComplete="off"
                                disabled={actionLoading}
                                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2]"
                              />
                            ) : (
                              <select
                                value={/^\d{4}$/.test(newCatYear) ? newCatYear : "2026"}
                                onChange={(e) => setNewCatYear(e.target.value)}
                                autoComplete="off"
                                disabled={actionLoading}
                                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2] cursor-pointer"
                              >
                                {getCategoryYearOptions().map((yr) => (
                                  <option key={yr} value={yr}>{yr}</option>
                                ))}
                              </select>
                            )}

                            <button
                              type="submit"
                              disabled={
                                actionLoading ||
                                !newCatName ||
                                (newCatYearMode === "text" && !newCatYear.trim()) ||
                                (newCatYearMode === "year" && !newCatYear)
                              }
                              className="w-full bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Create
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 Content: Subcategory Selection */}
                  {wizardStep === 3 && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                      <div className="bg-[#5113C2]/5 border border-[#5113C2]/10 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-extrabold text-[#7B3FE4] uppercase">
                        <span>Path:</span>
                        <span className="text-slate-500 font-sans font-semibold">
                          {catalogTree.find(m => m._id === wizardMainMainId)?.name} &gt; {wizardCategories.find((c: any) => c._id === wizardCatId)?.name} ({wizardCategories.find((c: any) => c._id === wizardCatId)?.year})
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Step 3: Subcategory Selection</h3>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Choose an existing Subcategory under the active category or create a new one.</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Selector */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Subcategory</label>
                          <select
                            value={wizardSubId}
                            onChange={(e) => {
                              setWizardSubId(e.target.value);
                              setWizardSubSubId("");
                              clearSubcategoryDraft();
                            }}
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2] cursor-pointer"
                          >
                            <option value="">-- Choose Subcategory --</option>
                            {wizardSubcategories.map((s: any) => (
                              <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                          </select>

                          {wizardSubId && (
                            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 mt-2 animate-slide-up">
                              <span className="text-[9px] font-extrabold text-[#7B3FE4] uppercase tracking-wider">Rename / Delete Active Subcategory</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Rename subcategory"
                                  value={renameSubName}
                                  onChange={(e) => setRenameSubName(e.target.value)}
                                  className="flex-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameSubcategory(wizardSubId, renameSubName)}
                                  className="bg-[#5113C2] hover:bg-[#42169B] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubcategory(wizardSubId)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] bg-slate-100/80 hidden md:block" />

                        {/* Creator */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{`Or Create New Subcategory under ${wizardCategories.find((c: any) => c._id === wizardCatId)?.name}`}</label>
                          <form onSubmit={handleWizardCreateSubcategory} className="flex gap-2" autoComplete="off">
                            <input
                              type="text"
                              placeholder="Subcategory name (e.g. History)"
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              autoComplete="off"
                              disabled={actionLoading}
                              className="flex-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2]"
                            />
                            <button
                              type="submit"
                              disabled={actionLoading || !newSubName}
                              className="bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Create
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4 Content: Sub-Subcategory Selection */}
                  {wizardStep === 4 && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                      <div className="bg-[#5113C2]/5 border border-[#5113C2]/10 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-extrabold text-[#7B3FE4] uppercase">
                        <span>Path:</span>
                        <span className="text-slate-500 font-sans font-medium">
                          {catalogTree.find(m => m._id === wizardMainMainId)?.name} &gt; {wizardCategories.find((c: any) => c._id === wizardCatId)?.name} &gt; {wizardSubcategories.find((s: any) => s._id === wizardSubId)?.name}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Step 4: Sub-Subcategory Selection</h3>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Choose an existing Sub-Subcategory under the active subcategory or create a new one.</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Selector */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Sub-Subcategory</label>
                          <select
                            value={wizardSubSubId}
                            onChange={(e) => {
                              setWizardSubSubId(e.target.value);
                              clearSubSubcategoryDraft();
                            }}
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2] cursor-pointer"
                          >
                            <option value="">-- Choose Sub-Subcategory --</option>
                            {wizardSubSubcategories.map((ss: any) => (
                              <option key={ss._id} value={ss._id}>{ss.name}</option>
                            ))}
                          </select>

                          {wizardSubSubId && (
                            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 mt-2 animate-slide-up">
                              <span className="text-[9px] font-extrabold text-[#7B3FE4] uppercase tracking-wider">Rename / Delete Active Sub-Subcategory</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Rename sub-subcategory"
                                  value={renameSubSubName}
                                  onChange={(e) => setRenameSubSubName(e.target.value)}
                                  className="flex-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameSubSubcategory(wizardSubSubId, renameSubSubName)}
                                  className="bg-[#5113C2] hover:bg-[#42169B] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubSubcategory(wizardSubSubId)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] bg-slate-100/80 hidden md:block" />

                        {/* Creator */}
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{`Or Create New Sub-Subcategory under ${wizardSubcategories.find((s: any) => s._id === wizardSubId)?.name}`}</label>
                          <form onSubmit={handleWizardCreateSubSubcategory} className="flex gap-2" autoComplete="off">
                            <input
                              type="text"
                              placeholder="Sub-sub name (e.g. Modern India)"
                              value={newSubSubName}
                              onChange={(e) => setNewSubSubName(e.target.value)}
                              autoComplete="off"
                              disabled={actionLoading}
                              className="flex-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#5113C2]"
                            />
                            <button
                              type="submit"
                              disabled={actionLoading || !newSubSubName}
                              className="bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Create
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5 Content: Document Upload */}
                  {wizardStep === 5 && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                      <div className="bg-[#5113C2]/5 border border-[#5113C2]/10 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-extrabold text-[#7B3FE4] uppercase">
                        <span>Selected Path:</span>
                        <span className="text-slate-500 font-sans font-medium">
                          {catalogTree.find(m => m._id === wizardMainMainId)?.name} &gt; {wizardCategories.find((c: any) => c._id === wizardCatId)?.name} &gt; {wizardSubcategories.find((s: any) => s._id === wizardSubId)?.name} &gt; {wizardSubSubcategories.find((ss: any) => ss._id === wizardSubSubId)?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Uploader */}
                        <div className="flex flex-col gap-4">
                          {uploadStatus === "idle" && (
                            <>
                              <div>
                                <h3 className="text-xs font-bold text-slate-700 uppercase mb-1">{`Upload PDF under ${wizardSubSubcategories.find((ss: any) => ss._id === wizardSubSubId)?.name}`}</h3>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Browse a PDF document to upload. File details are saved to MongoDB metadata.</p>
                              </div>

                              <form
                                autoComplete="off"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!pdfFile || !docTitle.trim() || !wizardSubSubId) return;

                                  clearAllWizardDrafts();
                                  setActionLoading(true);
                                  setUploadProgress(0);
                                  setUploadStatus("uploading");
                                  setUploadError("");
                                  setLastUploadedTitle(docTitle);

                                  const formData = new FormData();
                                  formData.append("file", pdfFile);
                                  formData.append("title", docTitle.trim());
                                  formData.append("description", docDescription);
                                  formData.append("subSubcategoryId", wizardSubSubId);

                                  const xhr = new XMLHttpRequest();
                                  xhr.open("POST", "/api/documents", true);

                                  xhr.upload.onprogress = (event) => {
                                    if (event.lengthComputable) {
                                      const percentage = Math.round((event.loaded / event.total) * 100);
                                      setUploadProgress(percentage);
                                    }
                                  };

                                  xhr.onload = async () => {
                                    setActionLoading(false);
                                    if (xhr.status >= 200 && xhr.status < 300) {
                                      try {
                                        toast.success(`Document "${docTitle}" successfully uploaded!`);
                                        setUploadStatus("success");
                                        setDocTitle("");
                                        setDocDescription("");
                                        setPdfFile(null);
                                        const fileInput = document.getElementById("wizard-file-input") as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                        await fetchCatalogTree();
                                      } catch (parseErr) {
                                        setUploadStatus("error");
                                        setUploadError("Failed to parse server response.");
                                        toast.error("Upload succeeded, but response was invalid.");
                                      }
                                    } else {
                                      setUploadStatus("error");
                                      try {
                                        const data = JSON.parse(xhr.responseText);
                                        setUploadError(data.error || "Failed to upload document");
                                        toast.error(data.error || "Failed to upload document");
                                      } catch {
                                        setUploadError("Failed to upload document");
                                        toast.error("Failed to upload document");
                                      }
                                    }
                                  };

                                  xhr.onerror = () => {
                                    setActionLoading(false);
                                    setUploadStatus("error");
                                    setUploadError("Network connection error. Please try again.");
                                    toast.error("Connection error. Try again.");
                                  };

                                  xhr.send(formData);
                                }}
                                className="flex flex-col gap-3"
                              >
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold uppercase text-slate-400 font-sans">PDF Title</label>
                                  <input
                                    type="text"
                                    placeholder="Ex: GS Prelims Guide 2026"
                                    value={docTitle}
                                    onChange={(e) => setDocTitle(e.target.value)}
                                    autoComplete="off"
                                    disabled={actionLoading}
                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#5113C2] transition-all"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold uppercase text-slate-400 font-sans">Description (Optional)</label>
                                  <input
                                    type="text"
                                    placeholder="Details about file content"
                                    value={docDescription}
                                    onChange={(e) => setDocDescription(e.target.value)}
                                    autoComplete="off"
                                    disabled={actionLoading}
                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#5113C2] transition-all"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold uppercase text-slate-400 font-sans">Choose PDF Document</label>
                                  <input
                                    id="wizard-file-input"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setPdfFile(file);
                                        // Suggest PDF title from filename only (never touches category create fields)
                                        if (!docTitle.trim()) {
                                          const fileNameWithoutExt =
                                            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                                          const cleanName = fileNameWithoutExt
                                            .replace(/[_-]/g, " ")
                                            .trim()
                                            .replace(/\b\w/g, (c) => c.toUpperCase());
                                          setDocTitle(cleanName);
                                        }
                                      }
                                    }}
                                    disabled={actionLoading}
                                    className="w-full text-xs font-bold text-slate-505 bg-slate-50 border border-slate-200/80 border-dashed rounded-xl px-3.5 py-2.5 outline-none focus:bg-white transition-all cursor-pointer font-sans"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={actionLoading || !pdfFile || !docTitle}
                                  className="w-full bg-[#F5C518] hover:bg-[#E5B612] text-[#42169B] font-extrabold text-[10px] py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed mt-1"
                                >
                                  <span>UPLOAD TO AWS S3 BUCKET</span>
                                </button>
                              </form>
                            </>
                          )}

                          {uploadStatus === "uploading" && (
                            <div className="flex flex-col items-center justify-center p-6 border border-slate-100/60 rounded-2xl bg-white shadow-sm gap-5 animate-slide-up select-none min-h-[300px] w-full">
                              {/* Circular Progress Ring */}
                              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                                <svg className="w-16 h-16 transform -rotate-90">
                                  <circle
                                    className="text-slate-100"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="28"
                                    cx="32"
                                    cy="32"
                                  />
                                  <circle
                                    className="text-[#7B3FE4] transition-all duration-300"
                                    strokeWidth="4"
                                    strokeDasharray={2 * Math.PI * 28}
                                    strokeDashoffset={2 * Math.PI * 28 * (1 - uploadProgress / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="28"
                                    cx="32"
                                    cy="32"
                                  />
                                </svg>
                                <span className="absolute text-xs font-black text-slate-700">{uploadProgress}%</span>
                              </div>

                              <div className="text-center flex flex-col gap-1 w-full">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Uploading Document</h4>
                                <p className="text-[9px] text-slate-450 font-medium truncate max-w-[220px] mx-auto">
                                  File: {pdfFile?.name}
                                </p>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#7B3FE4] to-[#5113C2] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(81,19,194,0.3)]"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-extrabold text-[#7B3FE4] uppercase tracking-wider animate-pulse">
                                Streaming bytes to AWS S3...
                              </span>
                            </div>
                          )}

                          {uploadStatus === "success" && (
                            <div className="flex flex-col items-center justify-center p-6 border border-slate-100/60 rounded-2xl bg-white shadow-sm gap-5 animate-slide-up select-none min-h-[300px] w-full">
                              {/* Checkmark Animation Container */}
                              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse-glow" />
                                <svg className="w-16 h-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <circle cx="12" cy="12" r="10" />
                                </svg>
                                <svg className="absolute w-8 h-8 text-emerald-500 animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>

                              <div className="text-center flex flex-col gap-1.5 w-full">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider text-emerald-600">Upload Complete!</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[220px] mx-auto">
                                  Document <span className="font-extrabold text-slate-700">"{lastUploadedTitle}"</span> has been successfully saved to MongoDB and hosted on AWS S3.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setUploadStatus("idle")}
                                className="bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                              >
                                Upload Another Document
                              </button>
                            </div>
                          )}

                          {uploadStatus === "error" && (
                            <div className="flex flex-col items-center justify-center p-6 border border-slate-100/60 rounded-2xl bg-white shadow-sm gap-5 animate-slide-up select-none min-h-[300px] w-full">
                              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>

                              <div className="text-center flex flex-col gap-1 w-full">
                                <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wide">Upload Failed</h4>
                                <p className="text-[10px] text-slate-400 font-medium max-w-[220px] mx-auto leading-relaxed">
                                  {uploadError || "An error occurred while uploading. Please try again."}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setUploadStatus("idle")}
                                className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 cursor-pointer"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] bg-slate-100 hidden md:block" />

                        {/* PDF List */}
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-slate-700 uppercase mb-1">Uploaded PDFs ({wizardDocuments.length})</h3>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Registry files. Editing or deleting here will only update MongoDB (S3 remains intact).</p>
                          </div>

                          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {wizardDocuments.map((doc: any) => (
                              <div key={doc._id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 rounded-xl p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-4">
                                  <a
                                    href={doc.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[10.5px] font-extrabold text-indigo-650 hover:text-indigo-850 transition-colors truncate flex-1 min-w-0"
                                  >
                                    <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="truncate">{doc.title}</span>
                                  </a>
                                  
                                  <button
                                    onClick={() => handleDeleteDocument(doc._id)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                    title="Delete"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Rename PDF"
                                    defaultValue={doc.title}
                                    id={`rename-doc-wizard-input-${doc._id}`}
                                    className="flex-1 text-[9.5px] font-bold text-slate-700 bg-white border border-slate-200/80 rounded px-2.5 py-1.5 outline-none focus:border-[#5113C2]"
                                  />
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById(`rename-doc-wizard-input-${doc._id}`) as HTMLInputElement;
                                      if (input) handleRenameDocument(doc._id, input.value, doc.description);
                                    }}
                                    className="bg-[#5113C2] hover:bg-[#42169B] text-white text-[9px] font-bold px-2 py-1.5 rounded transition-colors cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ))}

                            {wizardDocuments.length === 0 && (
                              <span className="text-[10px] text-slate-400 italic py-6 text-center">No PDFs uploaded under this category yet.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls for Stepper */}
                <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
                  {wizardStep > 1 ? (
                    <button
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-extrabold px-6 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {wizardStep < 5 ? (
                    <button
                      type="button"
                      onClick={advanceWizardStep}
                      disabled={
                        (wizardStep === 1 && !wizardMainMainId) ||
                        (wizardStep === 2 && !wizardCatId) ||
                        (wizardStep === 3 && !wizardSubId) ||
                        (wizardStep === 4 && !wizardSubSubId)
                      }
                      className="bg-[#5113C2] hover:bg-[#42169B] text-white text-xs font-extrabold px-6 py-3.5 rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next Step</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setWizardMainMainId("");
                        setWizardCatId("");
                        setWizardSubId("");
                        setWizardSubSubId("");
                        clearAllWizardDrafts();
                        setDocTitle("");
                        setDocDescription("");
                        setPdfFile(null);
                        setUploadStatus("idle");
                        setWizardStep(1);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-extrabold px-6 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Reset Wizard</span>
                    </button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
      case "app-settings":
        return (
          <AppSettingsView />
        );
      case "app-manager-ncert":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 flex-1 pb-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 animate-slide-up select-none">
            {/* NCERT Column 1 */}
            <div className="flex flex-col gap-6">
              <Card className="flex flex-col h-[280px] justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">NCERT Repository</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">Textbook Library</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Manages standard textbooks, reference PDF indices, and classroom materials for Class 6 to 12.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100/80 pt-4 mt-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Standard Books</span>
                    <span className="text-lg font-black text-amber-500 block">580 books</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Downloads Track</span>
                    <span className="text-lg font-black text-amber-500 block">4,320 units</span>
                  </div>
                </div>
              </Card>
              <AccordionList />
            </div>

            {/* NCERT Column 2 */}
            <div className="flex flex-col gap-6">
              <VerticalBarChart />
              <SlidersCard />
            </div>

            {/* NCERT Column 3 */}
            <div className="flex flex-col gap-6">
              <VolumeDensityChart />
              <ProgressListCard />
            </div>
          </div>
        );

      case "dashboard":
      default: {
        // Compute all stats live from catalogTree (already loaded, no extra API call)
        let totalMainMain = catalogTree.length;
        let totalCategories = 0;
        let totalSubcategories = 0;
        let totalSubSubcategories = 0;
        let totalPDFs = 0;
        catalogTree.forEach((mm: any) => {
          const cats = mm.categories || [];
          totalCategories += cats.length;
          cats.forEach((cat: any) => {
            const subs = cat.subcategories || [];
            totalSubcategories += subs.length;
            subs.forEach((sub: any) => {
              const subSubs = sub.subSubcategories || [];
              totalSubSubcategories += subSubs.length;
              subSubs.forEach((ss: any) => { totalPDFs += (ss.documents || []).length; });
            });
          });
        });

        const dashStats = [
          { label: "Main Categories", value: totalMainMain, color: "#7B3FE4", bgClass: "bg-[#7B3FE4]/10", borderClass: "border-[#7B3FE4]/20",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
          { label: "Categories", value: totalCategories, color: "#FF6B6B", bgClass: "bg-[#FF6B6B]/10", borderClass: "border-[#FF6B6B]/20",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
          { label: "Subcategories", value: totalSubcategories, color: "#05C287", bgClass: "bg-[#05C287]/10", borderClass: "border-[#05C287]/20",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
          { label: "Sub-Subcategories", value: totalSubSubcategories, color: "#F59E0B", bgClass: "bg-amber-50", borderClass: "border-amber-200",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
          { label: "Total PDFs", value: totalPDFs, color: "#5113C2", bgClass: "bg-[#5113C2]/10", borderClass: "border-[#5113C2]/20",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
        ];
        const chartMax = Math.max(...dashStats.map((s) => s.value), 1);

        return (
          <div className="flex flex-col gap-6 mt-2 flex-1 pb-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 animate-slide-up select-none">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Catalog Overview</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Live stats from your UPSC catalog database</p>
              </div>
              <button onClick={fetchCatalogTree} className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>

            {loadingTree ? (
              <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#5113C2] border-r-4 border-transparent" />
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {dashStats.map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border ${stat.borderClass} ${stat.bgClass} p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: stat.color }} className="opacity-80">{stat.icon}</span>
                        <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ color: stat.color, background: `${stat.color}18` }}>Total</span>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-slate-800 leading-none tabular-nums">{stat.value.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-500 mt-1.5 leading-tight">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[11px] font-bold text-[#7B3FE4] uppercase tracking-wider">Distribution Chart</span>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Hierarchy level breakdown</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {dashStats.map((stat) => {
                      const pct = Math.round((stat.value / chartMax) * 100);
                      return (
                        <div key={stat.label} className="flex items-center gap-4">
                          <div className="w-36 text-right text-[10px] font-bold text-slate-500 shrink-0">{stat.label}</div>
                          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                            <div className="h-5 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(pct, stat.value > 0 ? 4 : 0)}%`, background: `linear-gradient(90deg, ${stat.color}99, ${stat.color})` }}>
                              {pct >= 20 && <span className="text-[9px] font-black text-white">{stat.value}</span>}
                            </div>
                          </div>
                          <div className="w-10 text-right text-[11px] font-extrabold shrink-0" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>5-level UPSC catalog hierarchy</span>
                    <span style={{ color: "#5113C2" }} className="font-extrabold">{totalPDFs} PDF{totalPDFs !== 1 ? "s" : ""} available</span>
                  </div>
                </Card>

                {/* Per Main Category Breakdown Table */}
                {catalogTree.length > 0 && (
                  <Card className="p-6">
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-[#7B3FE4] uppercase tracking-wider">Per Main Category Breakdown</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-slate-400 font-extrabold uppercase tracking-wider text-[9px]">
                            <th className="text-left pb-3 pr-4">Main Category</th>
                            <th className="text-center pb-3 px-3">Categories</th>
                            <th className="text-center pb-3 px-3">Subcategories</th>
                            <th className="text-center pb-3 px-3">Sub-Sub</th>
                            <th className="text-center pb-3 pl-3">PDFs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {catalogTree.map((mm: any) => {
                            const cats = mm.categories || [];
                            let mmSubs = 0, mmSubSubs = 0, mmPDFs = 0;
                            cats.forEach((cat: any) => {
                              const subs = cat.subcategories || [];
                              mmSubs += subs.length;
                              subs.forEach((sub: any) => {
                                const ss = sub.subSubcategories || [];
                                mmSubSubs += ss.length;
                                ss.forEach((s: any) => { mmPDFs += (s.documents || []).length; });
                              });
                            });
                            return (
                              <tr key={mm._id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-[#7B3FE4]/10 border border-[#7B3FE4]/20 flex items-center justify-center text-[7px] font-black text-[#7B3FE4] shrink-0">MM</span>
                                    <span className="font-bold text-slate-700">{mm.name}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-[#FF6B6B]">{cats.length}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-[#05C287]">{mmSubs}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-amber-500">{mmSubSubs}</td>
                                <td className="py-2.5 pl-3 text-center font-bold text-[#5113C2]">{mmPDFs}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-200 font-extrabold">
                            <td className="pt-3 pr-4 text-[9px] uppercase text-slate-400 tracking-wider">Total</td>
                            <td className="pt-3 px-3 text-center text-[#FF6B6B]">{totalCategories}</td>
                            <td className="pt-3 px-3 text-center text-[#05C287]">{totalSubcategories}</td>
                            <td className="pt-3 px-3 text-center text-amber-500">{totalSubSubcategories}</td>
                            <td className="pt-3 pl-3 text-center text-[#5113C2]">{totalPDFs}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </Card>
                )}

                {catalogTree.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                    <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p className="text-sm font-bold text-slate-400">No catalog data yet.</p>
                    <p className="text-xs text-slate-300 font-medium">Go to App Manager to create your first Main Main Category.</p>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }
    } // end switch
  };

  return (
    <div className="min-h-screen flex bg-[#F0F3FC] text-slate-800 font-sans overflow-x-hidden p-2">
      <Toaster position="top-right" reverseOrder={false} />
      {/* 1. Left Sidebar Section */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={logout}
        activeItem={activeTab}
        onChangeActiveItem={setActiveTab}
      />

      {/* 2. Main Content Dashboard Container */}
      <main className="flex-1 flex flex-col p-4 pr-6">
        {/* Top Header */}
        <Header user={user} onLogout={logout} />

        {/* 3-Column Dashboard Grid View Selection */}
        {renderContent()}
      </main>
    </div>
  );
}
