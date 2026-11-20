import React, { useState } from 'react';
import {
  Handshake,
  Loader2,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  submitPartnerApplication,
  uploadCampusImage,
} from '../lib/firestoreService';
import { IMAGE_PRESET_OPTIONS } from '../data/assets';
import {
  BUSINESS_CATEGORIES,
  type BusinessCategory,
} from '../types/campusloop';

export function PartnerPage() {
  const { user } = useAuth();
  const { myPartnerApplications } = useData();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Food & Cafés');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [proposedDiscount, setProposedDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(IMAGE_PRESET_OPTIONS[0].url);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('File exceeds 4 MB limit', 'error');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadCampusImage(file, 'partner-applications');
      setImageUrl(url);
      showToast('Business photo uploaded', 'success');
    } catch {
      showToast(
        'Direct upload unavailable',
        'info',
        'Select one of the preset gallery photos or enter an image URL.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (description.trim().length < 10) {
      showToast('Please write a business description of at least 10 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitPartnerApplication({
        submittedBy: user.uid,
        businessName,
        ownerName,
        category,
        contactNumber,
        email,
        address,
        proposedDiscount,
        description,
        imageUrl,
      });
      showToast(
        'Partnership application submitted',
        'success',
        'Our CampusLoop team will review your Dehradun listing shortly.'
      );
      setBusinessName('');
      setOwnerName('');
      setContactNumber('');
      setEmail('');
      setAddress('');
      setProposedDiscount('');
      setDescription('');
    } catch (err) {
      showToast(
        'Submission failed',
        'error',
        err instanceof Error ? err.message : 'Please check all fields and retry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
          Partner With CampusLoop
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#645D78]">
          Own a café, store, salon, gym, or student service in Dehradun? Submit your
          business to reach DBS Global University students with exclusive campus deals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Application Form */}
        <section className="rounded-2xl border border-[#EAE6F3] bg-white p-6 sm:p-8 lg:col-span-7">
          <div className="flex items-center gap-3 border-b border-[#EAE6F3] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EDFF] text-[#673AB7]">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#252033]">
                Business Partnership Application
              </h2>
              <p className="text-xs text-[#645D78]">
                Applications are reviewed by CampusLoop administrators before going live.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-biz-name"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Business Name
                </label>
                <input
                  id="partner-biz-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Himalayan Brew House"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="partner-owner"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Owner Name
                </label>
                <input
                  id="partner-owner"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rohan Rawat"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-category"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Business Category
                </label>
                <select
                  id="partner-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="partner-phone"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Contact Number
                </label>
                <input
                  id="partner-phone"
                  type="tel"
                  required
                  minLength={6}
                  maxLength={30}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98970 00000"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-email"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Business Email
                </label>
                <input
                  id="partner-email"
                  type="email"
                  required
                  maxLength={160}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@yourbusiness.in"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="partner-discount"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Proposed Student Discount
                </label>
                <input
                  id="partner-discount"
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={proposedDiscount}
                  onChange={(e) => setProposedDiscount(e.target.value)}
                  placeholder="e.g. 20% off total bill with college ID"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="partner-address"
                className="block text-sm font-medium text-[#252033]"
              >
                Business Address (Dehradun)
              </label>
              <input
                id="partner-address"
                type="text"
                required
                minLength={5}
                maxLength={240}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop 12, Chakrata Road, Selaqui, Dehradun"
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="partner-desc"
                className="block text-sm font-medium text-[#252033]"
              >
                Business Description
              </label>
              <textarea
                id="partner-desc"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell students about your ambience, signature offerings, hours, and why students love visiting..."
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div className="space-y-2.5 rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-[#252033]">
                  Business Photograph
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EAE6F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#45207A] hover:bg-[#F3EDFF]">
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <select
                value={
                  IMAGE_PRESET_OPTIONS.some((o) => o.url === imageUrl)
                    ? imageUrl
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) setImageUrl(e.target.value);
                }}
                className="w-full rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2 text-xs text-[#252033]"
              >
                <option value="">Or choose a curated editorial preset...</option>
                {IMAGE_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#673AB7] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Partnership Application
            </button>
          </form>
        </section>

        {/* Submitted Applications Status */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-[#EAE6F3] bg-white p-6">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Your Submitted Applications ({myPartnerApplications.length})
            </h2>
            <p className="mt-1 text-xs text-[#645D78]">
              Live status updates from Firestore as administrators review your submission.
            </p>

            {myPartnerApplications.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#FAFAFC] p-4 text-xs text-[#645D78] border border-[#EAE6F3]">
                You haven’t submitted a business application yet. Complete the form to list a
                local Dehradun business.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#EAE6F3]">
                {myPartnerApplications.map((app) => (
                  <div key={app.id} className="py-4 first:pt-1 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#252033]">
                          {app.businessName}
                        </p>
                        <p className="text-xs text-[#645D78]">
                          {app.category} · {app.proposedDiscount}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${
                          app.status === 'Approved'
                            ? 'text-emerald-700'
                            : app.status === 'Rejected'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {app.status === 'Approved' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : app.status === 'Rejected' ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
