// // src/components/screens/license-screen.tsx
// import { useState, useEffect } from "react";
// import { Loader2Icon } from "lucide-react";
// import {
//   RiShieldFill,
//   RiTicket2Fill,
//   RiTimeFill,
//   RiExternalLinkFill,
//   RiCheckboxCircleFill,
//   RiSparkling2Fill,
// } from "react-icons/ri";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { storeLicenseData } from "../window/ActivateLicense";
// import toast from "react-hot-toast";
// import { generatePhrase } from "../../lib/namegenerator";
// import { fetch } from "@tauri-apps/plugin-http";
// import { Label } from "../ui/label";

// const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

// interface DiscountData {
//   isActive: boolean;
//   title: string;
//   startDate: string;
//   endDate: string;
//   couponCode: string;
//   percentage: number;
//   description: string;
// }

// interface LicenseScreenProps {
//   licenseKey: string;
//   setLicenseKey: (value: string) => void;
//   userName: string;
//   setUserName: (value: string) => void;
// }

// function CountdownTimer({ endDate }: { endDate: string }) {
//   const [timeLeft, setTimeLeft] = useState("");

//   useEffect(() => {
//     const calculate = () => {
//       const end = new Date(endDate).getTime();
//       const now = Date.now();
//       const diff = end - now;

//       if (diff <= 0) {
//         setTimeLeft("Expired");
//         return;
//       }

//       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//       const hours = Math.floor(
//         (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//       );
//       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diff % (1000 * 60)) / 1000);

//       if (days > 0) {
//         setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
//       } else {
//         setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//       }
//     };

//     calculate();
//     const interval = setInterval(calculate, 1000);
//     return () => clearInterval(interval);
//   }, [endDate]);

//   return <span className="font-mono font-bold tabular-nums">{timeLeft}</span>;
// }

// function DiscountBanner({ discount }: { discount: DiscountData }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(discount.couponCode);
//     setCopied(true);
//     toast.success("Coupon code copied! 🎉", { duration: 2000 });
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="relative w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-orange-500/5 to-yellow-500/10">
//       {/* Decorative background glow */}
//       <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
//       <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

//       <div className="relative p-3 space-y-2">
//         {/* Header row */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-1.5">
//             <RiSparkling2Fill className="w-4 h-4 text-primary" />
//             <span className="text-xs font-bold text-primary font-heading uppercase tracking-wide">
//               Limited Offer
//             </span>
//           </div>
//           {/* Percentage badge */}
//           <div className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full font-heading">
//             {discount.percentage}% OFF
//           </div>
//         </div>

//         {/* Title */}
//         <p className="text-sm font-bold text-foreground font-heading leading-tight">
//           {discount.title}
//         </p>

//         {/* Description */}
//         <p className="text-xs text-foreground/60 leading-relaxed">
//           {discount.description}
//         </p>

//         {/* Coupon + Timer row */}
//         <div className="flex items-center justify-between gap-2 pt-1">
//           {/* Coupon code */}
//           <button
//             onClick={handleCopy}
//             className="flex items-center space-x-1.5 bg-background/80 border border-dashed border-primary/50 rounded-lg px-2.5 py-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
//           >
//             <RiTicket2Fill className="w-3.5 h-3.5 text-primary" />
//             <span className="font-mono text-xs font-bold tracking-wider text-foreground">
//               {discount.couponCode}
//             </span>
//             <span className="text-[10px] text-foreground/50 group-hover:text-primary transition-colors">
//               {copied ? "✓ Copied!" : "tap to copy"}
//             </span>
//           </button>

//           {/* Countdown */}
//           <div className="flex items-center space-x-1 text-foreground/60">
//             <RiTimeFill className="w-3 h-3 text-orange-400 shrink-0" />
//             <span className="text-[10px]">Ends in </span>
//             <span className="text-[10px] text-orange-400">
//               <CountdownTimer endDate={discount.endDate} />
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function LicenseScreen({
//   licenseKey,
//   setLicenseKey,
//   userName,
//   setUserName,
// }: LicenseScreenProps) {
//   const [loading, setLoading] = useState({
//     activation: false,
//     discount: true,
//   });
//   const [isActivated, setIsActivated] = useState(false);
//   const [discount, setDiscount] = useState<DiscountData | null>(null);

//   // Fetch discount on mount
//   useEffect(() => {
//     const fetchDiscount = async () => {
//       try {
//         const res = await fetch("https://api.blinkeye.app/discount", {
//           method: "GET",
//         });
//         const data: DiscountData = await res.json();
//         if (data.isActive) {
//           setDiscount(data);
//         }
//       } catch (err) {
//         console.error("Failed to fetch discount:", err);
//       } finally {
//         setLoading((prev) => ({ ...prev, discount: false }));
//       }
//     };

//     fetchDiscount();
//   }, []);

//   const handleActivate = async (e: React.FormEvent) => {
//     const instanceName = generatePhrase();
//     e.preventDefault();

//     if (!licenseKey.trim()) {
//       toast.error("Please enter a license key");
//       return;
//     }

//     setLoading((prev) => ({ ...prev, activation: true }));

//     try {
//       const response = await fetch(
//         "https://api.blinkeye.app/activate-license",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             license_key: licenseKey,
//             instance_name: userName ? userName : instanceName,
//             handshake_password: handshakePassword,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(`Error: ${data.message || "Unknown error"}`);
//       }

//       if (data.meta?.store_id === 134128 || data.meta?.store_id === 132851) {
//         await storeLicenseData(data);
//         toast.success("License activated successfully! 🎉", {
//           duration: 2000,
//           position: "bottom-right",
//         });
//         setLicenseKey("");
//         setUserName("");
//         setIsActivated(true);
//       } else {
//         toast.error("Invalid license. Store ID mismatch.", {
//           duration: 3000,
//           position: "bottom-right",
//         });
//       }
//     } catch (error) {
//       console.error("Activation error:", error);
//       toast.error("Failed to activate license. Please try again.", {
//         duration: 2000,
//         position: "bottom-right",
//       });
//     } finally {
//       setLoading((prev) => ({ ...prev, activation: false }));
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-full space-y-4 px-2">
//       {/* Header */}
//       <div className="text-center space-y-1">
//         <div className="flex items-center justify-center mb-2">
//           <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
//             <RiShieldFill className="w-8 h-8 text-green-500" />
//           </div>
//         </div>
//         <h2 className="text-2xl font-bold font-heading">License Activation</h2>
//         <p className="text-xs text-foreground/60 max-w-xs mx-auto">
//           Have a license key? Activate it below.{" "}
//           <span className="font-semibold text-foreground/80">
//             No key? Just hit &apos;Complete&apos;.
//           </span>
//         </p>
//       </div>

//       {/* Discount Banner */}
//       <div className="w-full max-w-md">
//         {loading.discount ? (
//           <div className="h-24 rounded-xl bg-foreground/5 animate-pulse" />
//         ) : discount ? (
//           <DiscountBanner discount={discount} />
//         ) : null}
//       </div>

//       {/* License Form or Activated State */}
//       <div className="w-full max-w-md">
//         {isActivated ? (
//           <div className="text-center space-y-3 p-6 border border-green-500/20 bg-green-500/5 rounded-xl">
//             <RiCheckboxCircleFill className="w-12 h-12 text-green-500 mx-auto" />
//             <h3 className="text-xl font-heading font-bold text-green-500">
//               License Activated!
//             </h3>
//             <p className="text-sm text-foreground/60">
//               You&apos;re all set. Click <strong>Complete</strong> to finish
//               setup.
//             </p>
//           </div>
//         ) : (
//           <form
//             className="w-full p-4 border border-foreground/10 bg-background/50 rounded-xl shadow-sm space-y-3"
//             onSubmit={handleActivate}
//           >
//             <div className="space-y-3">
//               <div>
//                 <Label
//                   htmlFor="activationKey"
//                   className="text-xs font-semibold text-foreground/70"
//                 >
//                   License Key
//                 </Label>
//                 <Input
//                   type="text"
//                   id="activationKey"
//                   value={licenseKey}
//                   onChange={(e) => setLicenseKey(e.target.value)}
//                   placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
//                   disabled={loading.activation}
//                   className="w-full mt-1 font-mono text-sm"
//                 />
//               </div>

//               <div>
//                 <Label
//                   htmlFor="userName"
//                   className="text-xs font-semibold text-foreground/70"
//                 >
//                   Your Name{" "}
//                   <span className="text-foreground/40 font-normal">
//                     (optional)
//                   </span>
//                 </Label>
//                 <Input
//                   type="text"
//                   id="userName"
//                   value={userName}
//                   onChange={(e) => setUserName(e.target.value)}
//                   placeholder="John Doe"
//                   disabled={loading.activation}
//                   className="w-full mt-1"
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 disabled={loading.activation}
//                 className="w-full font-semibold"
//               >
//                 {loading.activation ? (
//                   <>
//                     <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
//                     Activating...
//                   </>
//                 ) : (
//                   <>
//                     <RiShieldFill className="w-4 h-4 mr-2" />
//                     Activate License
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         )}
//       </div>

//       {/* Get License CTA */}
//       {!isActivated && (
//         <div className="text-center space-y-1">
//           <p className="text-xs text-foreground/50">
//             Don&apos;t have a license key?
//           </p>
//           <a
//             href="https://blinkeye.app/en/pricing"
//             target="_blank"
//             rel="noreferrer"
//             className="inline-flex items-center space-x-1 text-xs font-semibold text-primary hover:underline"
//           >
//             <span>Get a license &amp; support the developer</span>
//             <RiExternalLinkFill className="w-3 h-3" />
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }
// src/components/screens/license-screen.tsx
import { useState, useEffect } from "react";
import {
  RiShieldFill,
  RiTicket2Fill,
  RiTimeFill,
  RiExternalLinkFill,
  RiSparkling2Fill,
  RiHeartFill,
  RiCupFill,
} from "react-icons/ri";
import { Button } from "../ui/button";
import { fetch } from "@tauri-apps/plugin-http";
// import { storeLicenseData } from "../window/ActivateLicense";
// import toast from "react-hot-toast";
// import { generatePhrase } from "../../lib/namegenerator";
// import { Label } from "../ui/label";
// import { Input } from "../ui/input";
// import { Loader2Icon } from "lucide-react";

// const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

interface DiscountData {
  isActive: boolean;
  title: string;
  startDate: string;
  endDate: string;
  couponCode: string;
  percentage: number;
  description: string;
}

// interface LicenseScreenProps {
//   licenseKey: string;
//   setLicenseKey: (value: string) => void;
//   userName: string;
//   setUserName: (value: string) => void;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LicenseScreen() {
  const [discountLoading, setDiscountLoading] = useState(true);
  const [discount, setDiscount] = useState<DiscountData | null>(null);

  // ── Fetch discount on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch("https://api.blinkeye.app/discount", {
          method: "GET",
        });
        const data: DiscountData = await res.json();
        if (data.isActive) setDiscount(data);
      } catch (err) {
        console.error("Failed to fetch discount info:", err);
      } finally {
        setDiscountLoading(false);
      }
    };
    fetchDiscount();
  }, []);

  // ── Commented out: activation handler ───────────────────────────────────
  // const handleActivate = async (e: React.FormEvent) => { ... };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-5 px-2">
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <RiHeartFill className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-heading">Support Blink Eye</h2>
        <p className="text-xs text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          Blink Eye is built by an indie developer. A license keeps the app
          alive and gets you{" "}
          <span className="text-foreground/80 font-semibold">
            premium features
          </span>{" "}
          forever.
        </p>
      </div>

      {/* ── Discount Banner / No-sale state ── */}
      <div className="w-full max-w-md">
        {discountLoading ? (
          <div className="h-28 rounded-xl bg-foreground/5 animate-pulse" />
        ) : discount ? (
          <DiscountBanner discount={discount} />
        ) : (
          <NoDealCard />
        )}
      </div>

      {/* ── "Why buy?" pill list ── */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2">
        {[
          {
            icon: <RiShieldFill className="w-3.5 h-3.5 text-green-500" />,
            text: "Lifetime license",
          },
          {
            icon: <RiSparkling2Fill className="w-3.5 h-3.5 text-yellow-500" />,
            text: "Unlock all features",
          },
          {
            icon: <RiCupFill className="w-3.5 h-3.5 text-primary" />,
            text: "Support indie dev",
          },
          {
            icon: <RiHeartFill className="w-3.5 h-3.5 text-pink-500" />,
            text: "Future updates free",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2"
          >
            {item.icon}
            <span className="text-xs text-foreground/70 font-medium">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* ── CTA Button ── */}
      <div className="text-center space-y-2">
        <a
          href="https://blinkeye.app/en/pricing"
          target="_blank"
          rel="noreferrer"
        >
          <Button className="font-semibold px-6">
            <RiExternalLinkFill className="w-4 h-4 mr-2" />
            Get a License Key
          </Button>
        </a>
        <p className="text-[11px] text-foreground/40">
          Already have one? You can activate it inside the app after setup.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return <span className="font-mono font-bold tabular-nums">{timeLeft}</span>;
}

function DiscountBanner({ discount }: { discount: DiscountData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(discount.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-orange-500/5 to-yellow-500/10">
      {/* glow blobs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative p-3 space-y-2">
        {/* top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <RiSparkling2Fill className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary font-heading uppercase tracking-wide">
              Limited Offer
            </span>
          </div>
          <div className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full font-heading">
            {discount.percentage}% OFF
          </div>
        </div>

        {/* title */}
        <p className="text-sm font-bold text-foreground font-heading leading-tight">
          {discount.title}
        </p>

        {/* description */}
        <p className="text-xs text-foreground/60 leading-relaxed">
          {discount.description}
        </p>

        {/* coupon + countdown */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-background/80 border border-dashed border-primary/50 rounded-lg px-2.5 py-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <RiTicket2Fill className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs font-bold tracking-wider text-foreground">
              {discount.couponCode}
            </span>
            <span className="text-[10px] text-foreground/50 group-hover:text-primary transition-colors">
              {copied ? "✓ Copied!" : "tap to copy"}
            </span>
          </button>

          <div className="flex items-center space-x-1 text-foreground/60">
            <RiTimeFill className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="text-[10px]">Ends in </span>
            <span className="text-[10px] text-orange-400">
              <CountdownTimer endDate={discount.endDate} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoDealCard() {
  return (
    <div className="w-full rounded-xl border border-foreground/10 bg-foreground/5 p-4 text-center space-y-1">
      <p className="text-sm font-semibold text-foreground/70 font-heading">
        No active sale right now
      </p>
      <p className="text-xs text-foreground/45 leading-relaxed">
        Follow{" "}
        <a
          href="https://x.com/blinkeyeapp"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          @blinkeyeapp
        </a>{" "}
        on X to catch the next deal first. 🔔
      </p>
    </div>
  );
}
