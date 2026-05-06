// Simple stroke icons — no fills, no AI-slop gradients
const Icon = ({d, size=20, stroke=1.6}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const IconArrow = (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>} />;
const IconCheck = (p) => <Icon {...p} d={<path d="M4 12.5l5 5L20 6"/>} />;
const IconMinus = (p) => <Icon {...p} d={<path d="M5 12h14"/>} />;
const IconPlus  = (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />;
const IconChev  = (p) => <Icon {...p} d={<path d="M6 9l6 6 6-6"/>} />;
const IconMenu  = (p) => <Icon {...p} d={<><path d="M4 7h16"/><path d="M4 17h16"/></>} />;
const IconClose = (p) => <Icon {...p} d={<><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>} />;
const IconBox   = (p) => <Icon {...p} d={<><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>} />;
const IconBolt  = (p) => <Icon {...p} d={<path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>} />;
const IconShip  = (p) => <Icon {...p} d={<><path d="M3 17h18"/><path d="M5 17V9h11l3 4v4"/><circle cx="8" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></>} />;
const IconPin   = (p) => <Icon {...p} d={<><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></>} />;
const IconCam   = (p) => <Icon {...p} d={<><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></>} />;
const IconChip  = (p) => <Icon {...p} d={<><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/></>} />;
const IconRing  = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></>} />;
const IconLED   = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>} />;
const IconLock  = (p) => <Icon {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>} />;
const IconStar  = (p) => <Icon {...p} d={<path d="M12 3l2.6 5.5 6 .9-4.4 4.2 1.1 6L12 16.9 6.7 19.6l1.1-6L3.4 9.4l6-.9L12 3z"/>} />;

window.Icons = {
  Arrow: IconArrow, Check: IconCheck, Minus: IconMinus, Plus: IconPlus, Chev: IconChev,
  Menu: IconMenu, Close: IconClose, Box: IconBox, Bolt: IconBolt, Ship: IconShip,
  Pin: IconPin, Cam: IconCam, Chip: IconChip, Ring: IconRing, LED: IconLED,
  Lock: IconLock, Star: IconStar,
};
