// Companion to HalfCircleTopRight — see that file for the full explanation of
// why this is now a single shared component instead of five duplicated ones.
//
// This one anchors to the bottom of whichever section it's placed in
// (`bottom-6` on mobile, easing to flush `bottom-0` at md: and up). Anchoring
// to the section bottom is safe regardless of section height — unlike the
// top-right circle, this doesn't need to "clear" any text above it, it just
// needs to sit near the bottom edge with a bit of breathing room on mobile
// so it isn't flush against whatever section comes next.
export default function HalfCircleBottomLeft() {
  return (
    <div className="absolute bottom-6 phone-lg:bottom-4 sm:bottom-2 md:bottom-0 left-0 w-[14px] h-[38px] phone-lg:w-[18px] phone-lg:h-[50px] sm:w-[24px] sm:h-[66px] md:w-[33px] md:h-[91px] z-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.009 339.082" className="w-full h-full">
        <path d="M1961.612,1338c-112.265,34.42-137.328,131.025-121.864,194.005,22.023,89.7,121.864,145.076,121.864,145.076V1338" transform="translate(1961.612 1677.082) rotate(180)" fill="#9972ab"/>
      </svg>
    </div>
  );
}