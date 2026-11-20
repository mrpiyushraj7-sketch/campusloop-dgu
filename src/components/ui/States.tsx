import React from 'react';
import { BrandLogo } from './BrandLogo';

export function LoadingScreen({ message = 'Loading CampusLoop...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFC] px-6">
      <BrandLogo />
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-[#EAE6F3]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#673AB7]" />
      </div>
      <p className="mt-3 text-sm text-[#645D78]">{message}</p>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-[#F3EDFF]/60" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-28 animate-pulse rounded bg-[#EAE6F3]" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#EAE6F3]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-[#F3EDFF]" />
            <div className="h-9 w-full animate-pulse rounded-xl bg-[#F3EDFF]" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EAE6F3] bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EDFF] text-[#673AB7]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#252033]">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#645D78]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
