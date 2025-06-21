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
    <BentoCard className="flex flex-col border border-[#27548A] bg-[#fef6e8]">
      <div className="font-bold text-[#183B4E]">Highly rated</div>
      <div className="mt-auto flex justify-end">
        <div className="text-4xl font-black text-[#000000]/50 md:text-7xl">
          <Ticker value="4.8" />
        </div>{" "}
        <sup className="text-xl text-[#183B4E]">★</sup>
      </div>
    </BentoCard>
  );
}

function FeatureTwo() {
  return (
    <BentoCard className="relative flex flex-col overflow-visible bg-[#deedff] sm:col-span-2">
      <strong className="text-2xl font-semibold text-[#183B4E]">
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
    <BentoCard className="flex flex-col bg-white border border-[#27548A]">
      <Bot className="size-8 md:size-12 text-[#27548A]" />
      <strong className="mt-1 inline-block text-sm text-[#183B4E]">Integrated AI</strong>

      <div className="mt-auto">
        <div className="text-sm font-medium text-[#183B4E]">What are the available services?</div>
        <div className="font-semibold text-[#27548A]">
          <TypingText text="Labs, Conference Rooms, Meeting Rooms, etc." waitTime={2000} alwaysVisibleCount={0} />
        </div>
      </div>
    </BentoCard>
  );
}

function FeatureFour() {
    return (
      <BentoCard className="relative flex flex-col justify-center bg-[#F3F3F3] sm:col-span-2">
        <Terminal className="w-full h-[200px] max-w-full">
        <TypingAnimation
            delay={0}
            duration={60}
            className="text-2xl font-semibold text-[#183B4E]"
          >
            Book Instantly
          </TypingAnimation>
          <AnimatedSpan className="text-lg text-[#27548A]" delay={100}>1. Tap </AnimatedSpan>
          <AnimatedSpan className="text-lg text-[#27548A]" delay={300}>2. Book</AnimatedSpan>
          <AnimatedSpan className="text-lg text-[#27548A]" delay={600}>3. Go</AnimatedSpan>

        </Terminal>
      </BentoCard>
    );
  }
  
function FeatureFive() {
  return (
    <BentoCard className="flex flex-col border border-[#27548A] items-center justify-center bg-[#fefaf3] sm:col-span-2">
      <BoldCopy text="SCHEDULE" backgroundTextClassName="text-gray-300" className="bg-transparent" textClassName="text-[#183B4E]" />
    </BentoCard>
  );
}

function FeatureSix() {
  return (
    <BentoCard className="bg-white border border-[#27548A]">
      <BarChart
        items={[
          {
            progress: 30,
            label: "Jan",
            className: "rounded-xl bg-[#DDA853]",
          },
          { progress: 70, label: "S", className: "rounded-xl bg-[#27548A]" },
          { progress: 60, label: "M", className: "rounded-xl bg-[#DDA853]" },
          { progress: 90, label: "T", className: "rounded-xl bg-[#27548A]" },
          { progress: 10, label: "W", className: "rounded-xl bg-[#DDA853]" },
          { progress: 20, label: "Th", className: "rounded-xl bg-[#27548A]" },
          { progress: 30, label: "F", className: "rounded-xl bg-[#DDA853]" },
          { progress: 90, label: "Sa", className: "rounded-xl bg-[#27548A]" },
        ]}
        height={100}
      />
      <div className="mt-4 text-center font-bold text-[#183B4E]">Weekly review</div>
      <div className="mt-2 text-center font-mono text-[#27548A]">Track and manage your bookings with detailed reports</div>
    </BentoCard>
  );
}

function FeatureSeven() {
  return (
    <BentoCard className="flex flex-col gap-2 items-center bg-[#fff8ed] sm:col-span-1">
     <CalendarEvent 
  dates={[
    {
      barColor: 'bg-[#27548A]',
      bgcolor: 'bg-blue-100',
      color: 'text-blue-900',
      dateColor: 'text-blue-600',
      time: '10:30 - 11:30',
      title: 'Meeting Room 1'
    },
    {
      barColor: 'bg-[#DDA853]',
      bgcolor: 'bg-yellow-100',
      color: 'text-yellow-900',
      dateColor: 'text-yellow-600',
      time: '12:00 - 12:45',
      title: 'Lab 3'
    },
    {
      barColor: 'bg-[#27548A]',
      bgcolor: 'bg-blue-100',
      color: 'text-blue-900',
      dateColor: 'text-blue-600',
      time: '14:00 - 15:00',
      title: 'Design Meeting'
    },
    {
      barColor: 'bg-[#DDA853]',
      bgcolor: 'bg-yellow-100',
      color: 'text-yellow-900',
      dateColor: 'text-yellow-600',
      time: '16:00 - 17:00',
      title: 'Development'
    },
    {
      barColor: 'bg-[#183B4E]',
      bgcolor: 'bg-gray-200',
      color: 'text-gray-900',
      dateColor: 'text-gray-600',
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
    <BentoCard className="relative flex flex-col border border-[#27548A] bg-[#e8eeff] sm:col-span-2">
<WideCard />
      <div className="mt-4">
        <div className="text-3xl font-black text-[#183B4E]">Confirmation Emails</div>
        <p className="text-lg text-[#27548A]">Stay in the loop with real-time confirmation emails sent straight to your inbox the moment you make a booking. Get all your details, dates, and payment info securely — no guesswork, no delays.</p>
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
