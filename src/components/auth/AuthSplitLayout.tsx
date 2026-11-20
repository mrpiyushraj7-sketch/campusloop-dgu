import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { MediaImage } from '../ui/MediaImage';
import { CAMPUSLOOP_IMAGES } from '../../data/assets';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

const HIGHLIGHTS = [
  {
    title: 'Exclusive Offers',
    detail: 'Verified student-only discounts across cafés, apparel, and fitness.',
  },
  {
    title: 'Local Discovery',
    detail: 'Curated Dehradun hangouts around Selaqui, Premnagar, and Rajpur Road.',
  },
  {
    title: 'Student Experiences',
    detail: 'Book essential campus services and register for college events in one tap.',
  },
];

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#FAFAFC] lg:grid-cols-12">
      {/* Left Brand & Lifestyle Panel */}
      <aside className="relative hidden overflow-hidden bg-[#252033] lg:col-span-6 lg:flex lg:flex-col lg:justify-between xl:col-span-7">
        <MediaImage
          src={CAMPUSLOOP_IMAGES.authLifestyle}
          alt="Students enjoying iced lattes and study time at a sunlit hillside café in Dehradun"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A132B]/95 via-[#252033]/55 to-[#252033]/35" />

        <div className="relative z-10 p-10 xl:p-12">
          <BrandLogo light />
        </div>

        <div className="relative z-10 max-w-xl p-10 xl:p-12">
          <p className="text-xs font-medium tracking-wide text-[#E3D5FF]">
            DBS Global University · Dehradun, Uttarakhand
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white xl:text-5xl">
            Discover More. Spend Less.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            CampusLoop brings together Dehradun’s favourite student cafés, everyday local
            services, exclusive campus deals, and university events in one thoughtfully
            designed platform.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-5 border-t border-white/15 pt-6">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title}>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/75">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="flex flex-col justify-between bg-white px-6 py-8 sm:px-10 lg:col-span-6 lg:px-14 xl:col-span-5">
        <div className="flex items-center justify-between lg:hidden">
          <BrandLogo />
          <span className="text-xs font-medium text-[#645D78]">Dehradun</span>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-8">{children}</div>

        <footer className="mx-auto w-full max-w-md border-t border-[#EAE6F3] pt-4 text-xs text-[#645D78]">
          Your Campus. Your City. Your Loop.
        </footer>
      </main>
    </div>
  );
}
