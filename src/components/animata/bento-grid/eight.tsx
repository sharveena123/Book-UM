import { Bot } from "lucide-react";


import { cn } from "@/lib/utils";
import AnimatedTimelinePage, { AnimatedTimeline } from "@/components/animata/progress/animatedtimeline";
import  AvatarList  from "@/components/animata/list/avatar-list";
import  BarChart from "@/components/animata/graphs/bar-chart";
import Ticker from "@/components/animata/text/ticker";
import Counter from "@/components/animata/text/counter";
import TypingText from "@/components/animata/text/typing-text";
import CalendarEvent from "../widget/calendar-event";
import WideCard from "../text/widecard";
import {    AnimatedSpan,    Terminal,    TypingAnimation,  } from "@/components/magicui/terminal";

// #region placeholder
function BoldCopy({
  text = "animata",
  className,
  textClassName,
  backgroundTextClassName,
}: {
  text: string;
  className?: string;
  textClassName?: string;
  backgroundTextClassName?: string;
}) {
  if (!text?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center bg-background px-2 py-2 md:px-6 md:py-4",
        className,
      )}
    >
      <div
        className={cn(
          "text-4xl font-black uppercase text-foreground/15 transition-all group-hover:opacity-50 md:text-8xl",
          backgroundTextClassName,
        )}
      >
        {text}
      </div>
      <div
        className={cn(
          "text-md absolute font-black uppercase text-foreground transition-all group-hover:text-4xl md:text-3xl group-hover:md:text-8xl",
          textClassName,
        )}
      >
        {text}
      </div>
    </div>
  );
}

function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-2xl p-4", className)}>
      {children}
    </div>
  );
}

function FeatureOne() {
  return (
    <BentoCard className="flex flex-col bg-yellow-300">
      <div className="font-bold text-yellow-700">Highly rated</div>
      <div className="mt-auto flex justify-end">
        <div className="text-4xl font-black text-black/60 md:text-7xl">
          <Ticker value="4.8" />
        </div>{" "}
        <sup className="text-xl text-yellow-700">★</sup>
      </div>
    </BentoCard>
  );
}

function FeatureTwo() {
  return (
    <BentoCard className="relative flex flex-col overflow-visible bg-violet-500 sm:col-span-2">
      <strong className="text-2xl font-semibold text-white">
        <Counter targetValue={179} format={(v) => +Math.ceil(v) + "k+ users"} />
      </strong>
      <div className="ml-4 mt-auto">
        <AvatarList size="sm" className="py-0" />
      </div>
    </BentoCard>
  );
}

function FeatureThree() {
  return (
    <BentoCard className="flex flex-col bg-orange-300">
      <Bot className="size-8 md:size-12" />
      <strong className="mt-1 inline-block text-sm">Integrated AI</strong>

      <div className="mt-auto">
        <div className="text-sm font-medium">What are the available services?</div>
        <div className="font-semibold">
          <TypingText text="Labs, Conference Rooms, Meeting Rooms, etc." waitTime={2000} alwaysVisibleCount={0} />
        </div>
      </div>
    </BentoCard>
  );
}

function FeatureFour() {
    return (
      <BentoCard className="relative flex flex-col justify-center bg-lime-300 sm:col-span-2">
        <Terminal className="w-full h-[200px] max-w-full">
        <TypingAnimation
            delay={0}
            duration={60}
            className="text-2xl font-semibold text-green-800"
          >
            Book Instantly
          </TypingAnimation>
          <AnimatedSpan className="text-lg" delay={100}>1. Tap </AnimatedSpan>
          <AnimatedSpan className="text-lg" delay={300}>2. Book</AnimatedSpan>
          <AnimatedSpan className="text-lg" delay={600}>3. Go</AnimatedSpan>

        </Terminal>
      </BentoCard>
    );
  }
  
function FeatureFive() {
  return (
    <BentoCard className="flex flex-col items-center justify-center bg-zinc-300 sm:col-span-2">
      <BoldCopy text="SCHEDULE" className="bg-transparent" textClassName="text-zinc-800" />
    </BentoCard>
  );
}

function FeatureSix() {
  return (
    <BentoCard className="bg-green-200">
      <BarChart
        items={[
          {
            progress: 30,
            label: "Jan",
            className: "rounded-xl bg-green-400",
          },
          { progress: 70, label: "S", className: "rounded-xl bg-green-400" },
          { progress: 60, label: "M", className: "rounded-xl bg-green-400" },
          { progress: 90, label: "T", className: "rounded-xl bg-green-400" },
          { progress: 10, label: "W", className: "rounded-xl bg-green-400" },
          { progress: 20, label: "Th", className: "rounded-xl bg-green-400" },
          { progress: 30, label: "F", className: "rounded-xl bg-green-400" },
          { progress: 90, label: "Sa", className: "rounded-xl bg-green-400" },
        ]}
        height={100}
      />
      <div className="mt-4 text-center font-bold">Weekly review</div>
      <div className="mt-2 text-center font-mono">Track and manage your bookings with detailed reports</div>
    </BentoCard>
  );
}

function FeatureSeven() {
  return (
    <BentoCard className="flex flex-col gap-2 items-center bg-rose-300 sm:col-span-1">
     <CalendarEvent 
  dates={[
    {
      barColor: 'bg-purple-700',
      bgcolor: 'bg-purple-200',
      color: 'text-purple-900',
      dateColor: 'text-purple-600',
      time: '10:30 - 11:30',
      title: 'Meeting Room 1'
    },
    {
      barColor: 'bg-cyan-700',
      bgcolor: 'bg-cyan-200',
      color: 'text-cyan-900',
      dateColor: 'text-cyan-600',
      time: '12:00 - 12:45',
      title: 'Lab 3'
    },
    {
      barColor: 'bg-green-700',
      bgcolor: 'bg-green-200',
      color: 'text-green-900',
      dateColor: 'text-green-600',
      time: '14:00 - 15:00',
      title: 'Design Meeting'
    },
    {
      barColor: 'bg-yellow-700',
      bgcolor: 'bg-yellow-200',
      color: 'text-yellow-900',
      dateColor: 'text-yellow-600',
      time: '16:00 - 17:00',
      title: 'Development'
    },
    {
      barColor: 'bg-red-700',
      bgcolor: 'bg-red-200',
      color: 'text-red-900',
      dateColor: 'text-red-600',
      time: '18:00 - 19:00',
      title: 'QA Testing'
    }
  ]}
 />
    </BentoCard>
  );
}


function FeatureEight() {
  return (
    <BentoCard className="relative flex flex-col bg-blue-200 sm:col-span-2">
<WideCard />
      <div className="mt-4">
        <div className="text-3xl font-black text-gray-800">Confirmation Emails</div>
        <p className="text-lg">Stay in the loop with real-time confirmation emails sent straight to your inbox the moment you make a booking. Get all your details, dates, and payment info securely — no guesswork, no delays.</p>
      </div>    </BentoCard>
  );
}

// #endregion

export default function Eight() {
  return (
    <div className="storybook-fix w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-3">
        <FeatureOne />
        <FeatureTwo />
        <FeatureThree />
        <FeatureFour />
        <FeatureFive />
        <FeatureSix />
        <FeatureSeven />
        <FeatureEight />
      </div>
    </div>
  );
}
