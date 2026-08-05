// Shared decorative accent used across Home, About, Services, Work, and
// ContactSnippet. Previously this exact component was copy-pasted into each
// file individually — five separate places that could (and did) drift out of
// sync. Now there's one definition; every page imports it.
//
// Positioning note: this renders with `absolute -top-2 right-0`, so the
// PARENT you place it in must have `position: relative` and should be the
// wrapper that starts right after that section's intro paragraph — not the
// whole section. Anchoring to the whole section (a percentage of its total
// height) is what caused the original bug: it worked fine on short sections
// and drifted into the content on longer ones, since section height varies a
// lot page to page. Anchoring to a wrapper that starts right after the intro
// keeps it in the same visual spot regardless of how long the content below
// it runs.
//
// Sizing is intentionally responsive — small on phones, scaling up to the
// original 33x91 size only from md: (tablet) upward, so it doesn't overwhelm
// a narrow mobile layout the way a flat size did before.
export default function HalfCircleTopRight() {
  return (
    <div className="absolute -top-2 right-0 w-[14px] h-[38px] phone-lg:w-[18px] phone-lg:h-[50px] sm:w-[24px] sm:h-[66px] mt-8 md:w-[33px] md:h-[91px] z-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.009 339.082" className="w-full h-full">
        <path d="M1961.612,1338c-112.265,34.42-137.328,131.025-121.864,194.005,22.023,89.7,121.864,145.076,121.864,145.076V1338" transform="translate(-1835.603 -1338)" fill="#452c63"/>
      </svg>
    </div>
  );
}