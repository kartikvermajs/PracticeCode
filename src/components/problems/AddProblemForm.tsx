"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Code2,
  HelpCircle,
  Loader2,
  Save,
  Check,
  ShieldCheck,
  Download,
  Info,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { extractSlugFromLeetCodeUrl } from "@/lib/problem-utils";
import { LeetCodeParsedProblem } from "@/lib/leetcode/types";
import { ImportPreviewModal } from "./ImportPreviewModal";

interface ExampleItem {
  input: string;
  output: string;
  explanation: string;
}

const COMMON_TAGS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Tree",
  "Bit Manipulation",
  "Two Pointers",
  "Matrix",
  "Stack",
  "Graph",
];

export function AddProblemForm() {
  const router = useRouter();

  // Importer State
  const [importUrl, setImportUrl] = useState("");
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<LeetCodeParsedProblem | null>(null);
  const [previewExists, setPreviewExists] = useState(false);
  const [previewExistingSlug, setPreviewExistingSlug] = useState<string | undefined>();
  const [previewExistingTitle, setPreviewExistingTitle] = useState<string | undefined>();
  const [previewExistingNumber, setPreviewExistingNumber] = useState<number | undefined>();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  // Manual Form Fields
  const [url, setUrl] = useState("");
  const [leetcodeId, setLeetcodeId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState<ExampleItem[]>([
    { input: "", output: "", explanation: "" },
  ]);
  const [constraintsInput, setConstraintsInput] = useState("");

  // Optional solution
  const [showSolutionSection, setShowSolutionSection] = useState(false);
  const [solutionLanguage, setSolutionLanguage] = useState("cpp");
  const [solutionCode, setSolutionCode] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [extractedSlugNotice, setExtractedSlugNotice] = useState<string | null>(null);

  // 1. Fetch & Preview from public LeetCode endpoint
  const handleFetchPreview = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || importUrl || url).trim();
    if (!targetUrl) {
      setPreviewError("Please enter a LeetCode problem URL.");
      return;
    }

    const extracted = extractSlugFromLeetCodeUrl(targetUrl);
    if (!extracted) {
      setPreviewError(
        "Could not extract a valid problem slug. Example format: https://leetcode.com/problems/single-number/"
      );
      return;
    }

    setPreviewError(null);
    setIsFetchingPreview(true);

    try {
      const res = await fetch("/api/problems/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, slug: extracted }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to fetch problem data from LeetCode. You can enter details manually below."
        );
      }

      setPreviewData(data.problem);
      setPreviewExists(data.exists);
      setPreviewExistingSlug(data.existingSlug);
      setPreviewExistingTitle(data.existingTitle);
      setPreviewExistingNumber(data.existingNumber);
      setIsPreviewOpen(true);
    } catch (err: any) {
      setPreviewError(
        err.message ||
          "Failed to fetch public problem data. Please use the manual form below as a fallback."
      );
    } finally {
      setIsFetchingPreview(false);
    }
  };

  // 2. Confirm Import from Preview
  const handleConfirmImport = async () => {
    if (!previewData) return;
    setIsConfirmingImport(true);
    setPreviewError(null);

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: previewData.url,
          leetcodeId: previewData.leetcodeId,
          title: previewData.title,
          slug: previewData.slug,
          difficulty: previewData.difficulty,
          tags: previewData.tags,
          description: previewData.description,
          examples: previewData.examples,
          constraints: previewData.constraints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save imported problem.");
      }

      setIsPreviewOpen(false);
      router.push(`/problems/${data.problem.slug}`);
      router.refresh();
    } catch (err: any) {
      console.error("Confirm import error:", err);
      setPreviewError(err.message || "Failed to save imported problem.");
      setIsConfirmingImport(false);
    }
  };

  // 3. Populate manual form from preview data ("Update manually")
  const handleUpdateManually = (prob: LeetCodeParsedProblem) => {
    setUrl(prob.url);
    setLeetcodeId(String(prob.leetcodeId));
    setTitle(prob.title);
    setSlug(prob.slug);
    setDifficulty(prob.difficulty);
    setTagsInput(prob.tags.join(", "));
    setDescription(prob.description);
    setExamples(
      prob.examples.map((ex) => ({
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation || "",
      }))
    );
    setConstraintsInput(prob.constraints.join("\n"));
    setIsPreviewOpen(false);
    setExtractedSlugNotice(`Populated details for "${prob.title}"`);

    // Smoothly scroll down to manual form
    const el = document.getElementById("manual-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 4. Auto-extract slug when manual LeetCode URL changes
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setFieldErrors((prev) => ({ ...prev, url: "" }));

    const extracted = extractSlugFromLeetCodeUrl(newUrl);
    if (extracted) {
      setSlug(extracted);
      setExtractedSlugNotice(`Extracted slug: "${extracted}"`);
      setFieldErrors((prev) => ({ ...prev, slug: "" }));

      // If title is empty, generate an initial formatted title from the slug
      if (!title.trim()) {
        const words = extracted
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        setTitle(words);
        setFieldErrors((prev) => ({ ...prev, title: "" }));
      }
    } else {
      setExtractedSlugNotice(null);
    }
  };

  // 5. Tag helper
  const addTag = (tag: string) => {
    const existingTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!existingTags.includes(tag)) {
      const updated = existingTags.length > 0 ? `${tagsInput}, ${tag}` : tag;
      setTagsInput(updated);
      setFieldErrors((prev) => ({ ...prev, tags: "" }));
    }
  };

  // 6. Examples helpers
  const handleExampleChange = (
    index: number,
    field: keyof ExampleItem,
    value: string
  ) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    setExamples(updated);
    setFieldErrors((prev) => ({ ...prev, examples: "" }));
  };

  const addExample = () => {
    setExamples([...examples, { input: "", output: "", explanation: "" }]);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples(examples.filter((_, i) => i !== index));
    }
  };

  // 7. Client-side form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!url.trim()) {
      errors.url = "LeetCode URL is required.";
    } else if (!/leetcode\.(?:com|cn)\/problems\//i.test(url.trim())) {
      errors.url = "Please enter a valid LeetCode problem URL (e.g. https://leetcode.com/problems/single-number/).";
    }

    const numId = parseInt(leetcodeId.trim(), 10);
    if (!leetcodeId.trim() || isNaN(numId) || numId <= 0) {
      errors.leetcodeId = "Please enter a valid positive problem number (e.g. 136).";
    }

    if (!title.trim()) {
      errors.title = "Problem title is required.";
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (!cleanSlug) {
      errors.slug = "Problem slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    if (!difficulty) {
      errors.difficulty = "Please select a difficulty level.";
    }

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagsArray.length === 0) {
      errors.tags = "Please enter at least one tag (e.g. Array, Bit Manipulation).";
    }

    if (!description.trim()) {
      errors.description = "Problem description is required.";
    }

    const validExamples = examples.filter(
      (ex) => ex.input.trim() && ex.output.trim()
    );
    if (validExamples.length === 0) {
      errors.examples = "Please provide at least one example with both Input and Output.";
    }

    const constraintsArray = constraintsInput
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
    if (constraintsArray.length === 0) {
      errors.constraints = "Please enter at least one constraint (one per line).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 8. Manual submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      setGeneralError("Please complete all required fields highlighted below.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const constraintsArray = constraintsInput
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);

      const cleanExamples = examples
        .filter((ex) => ex.input.trim() && ex.output.trim())
        .map((ex) => ({
          input: ex.input.trim(),
          output: ex.output.trim(),
          explanation: ex.explanation.trim() || undefined,
        }));

      const payload = {
        url: url.trim(),
        leetcodeId: parseInt(leetcodeId.trim(), 10),
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        difficulty,
        tags: tagsArray,
        description: description.trim(),
        examples: cleanExamples,
        constraints: constraintsArray,
        solutionCode: showSolutionSection ? solutionCode.trim() : undefined,
        solutionLanguage: showSolutionSection ? solutionLanguage : undefined,
      };

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          if (data.field === "leetcodeId") {
            setFieldErrors((prev) => ({
              ...prev,
              leetcodeId: data.error || "A problem with this LeetCode number already exists.",
            }));
          } else if (data.field === "slug") {
            setFieldErrors((prev) => ({
              ...prev,
              slug: data.error || "A problem with this slug already exists.",
            }));
          }
          throw new Error(data.error || "This problem already exists in your database.");
        } else if (res.status === 400 && data.errors) {
          setFieldErrors(data.errors);
          throw new Error("Validation failed. Please correct the fields above.");
        } else {
          throw new Error(data.error || "Failed to save problem.");
        }
      }

      // Success: redirect to /problems/[slug]
      router.push(`/problems/${data.problem.slug}`);
      router.refresh();
    } catch (err: any) {
      console.error("Save problem error:", err);
      setGeneralError(err.message || "An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/problems"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Problems</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Add Problem
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Import a solved LeetCode problem via URL or enter details manually.
          </p>
        </div>
      </div>

      {/* COMPLIANT QUICK IMPORTER SECTION */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 border border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Compliant LeetCode Importer
              </h2>
              <p className="text-xs text-slate-500">
                Paste any public problem link to preview and import its statement, test cases, and constraints.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Auth Compliant
          </span>
        </div>

        {/* URL Input & Fetch Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={importUrl}
              onChange={(e) => {
                setImportUrl(e.target.value);
                setPreviewError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFetchPreview();
                }
              }}
              placeholder="https://leetcode.com/problems/single-number/"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-mono placeholder:font-sans focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => handleFetchPreview()}
            disabled={isFetchingPreview}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            {isFetchingPreview ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Fetching Preview...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Fetch &amp; Preview</span>
              </>
            )}
          </button>
        </div>

        {/* Preview Error or Fallback Message */}
        {previewError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">{previewError}</span>
              <p className="text-slate-600">
                You can use the manual form below to paste your problem statement directly.
              </p>
            </div>
          </div>
        )}

        {/* Security & Compliance Info Footer + Bulk Import link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-blue-100/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Complies with security rules: never asks for or stores passwords or cookies.
            </span>
          </div>
          <Link
            href="/problems/import"
            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            <span>Need to import multiple problems? Try Bulk Import</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* MANUAL ENTRY / FALLBACK FORM */}
      <form
        id="manual-form-section"
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Problem Details
            </h2>
            <p className="text-xs text-slate-500">
              Review extracted fields or enter information manually.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Problem...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-blue-200" />
                <span>Save Problem</span>
              </>
            )}
          </button>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error saving problem: </span>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* SECTION 1: LeetCode Identification & URLs */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>LeetCode URL &amp; Identification</span>
          </h3>

          {/* LeetCode URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>LeetCode URL</span>
                <span className="text-rose-500">*</span>
              </label>
              {extractedSlugNotice && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {extractedSlugNotice}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://leetcode.com/problems/single-number/"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white font-mono placeholder:font-sans transition-colors ${
                  fieldErrors.url
                    ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                }`}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Paste the LeetCode URL here. The slug will be extracted automatically.
            </p>
            {fieldErrors.url && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.url}
              </p>
            )}
          </div>

          {/* Number, Title, and Slug Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Problem Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                <span>Problem number</span>
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={leetcodeId}
                onChange={(e) => {
                  setLeetcodeId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, leetcodeId: "" }));
                }}
                placeholder="136"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white font-mono transition-colors ${
                  fieldErrors.leetcodeId
                    ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                }`}
              />
              {fieldErrors.leetcodeId ? (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.leetcodeId}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500">
                  Official LeetCode problem ID.
                </p>
              )}
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                <span>Title</span>
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="Single Number"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white font-semibold transition-colors ${
                  fieldErrors.title
                    ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.title}
                </p>
              )}
            </div>
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Slug</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Used in /problems/[slug] and /practice/[slug]
              </span>
            </div>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
              <span className="px-3 text-xs font-mono text-slate-400 select-none">
                problems/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().trim());
                  setFieldErrors((prev) => ({ ...prev, slug: "" }));
                }}
                placeholder="single-number"
                className="w-full py-2.5 pr-3 bg-white text-xs sm:text-sm font-mono text-slate-900 border-l border-slate-200 outline-none"
              />
            </div>
            {fieldErrors.slug && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.slug}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: Difficulty & Topic Tags */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Difficulty &amp; Tags</span>
          </h3>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              <span>Difficulty</span>
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                const isSelected = difficulty === diff;
                const colorClasses =
                  diff === "Easy"
                    ? isSelected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-slate-200 text-slate-700 hover:border-emerald-200"
                    : diff === "Medium"
                    ? isSelected
                      ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                      : "border-slate-200 text-slate-700 hover:border-amber-200"
                    : isSelected
                    ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                    : "border-slate-200 text-slate-700 hover:border-rose-200";

                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      setDifficulty(diff);
                      setFieldErrors((prev) => ({ ...prev, difficulty: "" }));
                    }}
                    className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center ${colorClasses}`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
            {fieldErrors.difficulty && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.difficulty}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <span>Tags</span>
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                setFieldErrors((prev) => ({ ...prev, tags: "" }));
              }}
              placeholder="Array, Bit Manipulation, Hash Table"
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white transition-colors ${
                fieldErrors.tags
                  ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Comma-separated topic keywords. Or click suggestions below:
            </p>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {fieldErrors.tags && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {fieldErrors.tags}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 3: Description */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>Description</span>
              <span className="text-rose-500">*</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Paste problem text directly from LeetCode
            </span>
          </div>

          <div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder={`Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.`}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white font-sans transition-colors resize-y ${
                fieldErrors.description
                  ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.description}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 4: Examples */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>Examples</span>
                <span className="text-rose-500">*</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Provide at least one input/output test case example.
              </p>
            </div>

            <button
              type="button"
              onClick={addExample}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Example</span>
            </button>
          </div>

          {fieldErrors.examples && (
            <p className="text-xs text-rose-600 font-medium">
              {fieldErrors.examples}
            </p>
          )}

          <div className="space-y-4">
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Example {idx + 1}
                  </span>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove example"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Input:
                    </label>
                    <input
                      type="text"
                      value={ex.input}
                      onChange={(e) =>
                        handleExampleChange(idx, "input", e.target.value)
                      }
                      placeholder="nums = [2,2,1]"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Output:
                    </label>
                    <input
                      type="text"
                      value={ex.output}
                      onChange={(e) =>
                        handleExampleChange(idx, "output", e.target.value)
                      }
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Explanation (Optional):
                  </label>
                  <input
                    type="text"
                    value={ex.explanation}
                    onChange={(e) =>
                      handleExampleChange(idx, "explanation", e.target.value)
                    }
                    placeholder="Only 1 appears once in nums."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: Constraints */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>Constraints</span>
                <span className="text-rose-500">*</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Enter one constraint per line.
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={4}
              value={constraintsInput}
              onChange={(e) => {
                setConstraintsInput(e.target.value);
                setFieldErrors((prev) => ({ ...prev, constraints: "" }));
              }}
              placeholder={`1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element appears twice except for one element.`}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border bg-white transition-colors resize-y ${
                fieldErrors.constraints
                  ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
            {fieldErrors.constraints && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.constraints}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 6: Optional Solution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Accepted Solution (Optional)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSolutionSection(!showSolutionSection)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {showSolutionSection ? "Hide Solution" : "+ Add Original Solution"}
            </button>
          </div>

          {showSolutionSection && (
            <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
              <p className="text-xs text-slate-500">
                You can optionally record your verified solution code now. It will appear in the read-only solution panel on the problem page.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Solution Language
                </label>
                <select
                  value={solutionLanguage}
                  onChange={(e) => setSolutionLanguage(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:border-blue-600 focus:outline-none"
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="c">C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Solution Code
                </label>
                <textarea
                  rows={8}
                  value={solutionCode}
                  onChange={(e) => setSolutionCode(e.target.value)}
                  placeholder={`class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        int ans = 0;\n        for (int x : nums) ans ^= x;\n        return ans;\n    }\n};`}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-slate-950 text-slate-100 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          <Link
            href="/problems"
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold shadow-md shadow-blue-500/10 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Problem...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-blue-200" />
                <span>Save Problem</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* IMPORT PREVIEW MODAL */}
      <ImportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        problem={previewData}
        exists={previewExists}
        existingSlug={previewExistingSlug}
        existingTitle={previewExistingTitle}
        existingNumber={previewExistingNumber}
        onConfirmImport={handleConfirmImport}
        onUpdateManually={handleUpdateManually}
        isImporting={isConfirmingImport}
      />
    </div>
  );
}
