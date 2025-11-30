
// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';
import { Link } from 'react-router-dom';
import ParticleNetwork from './ParticleNetwork';
// FIX: Corrected import to reflect that Navbar is a default export.
import Navbar from './Navbar';
import Footer from './Footer';
import { 
    ScheduleIcon, 
    SparklesIcon, 
    AnalyticsIcon, 
    InstagramIcon, 
    FacebookIcon,
    LinkedInIcon,
    TikTokIcon,
    YouTubeIcon,
    PinterestIcon,
    ConversationIcon,
    CheckCircleIcon,
    MicrophoneIcon,
} from './icons';

interface HomePageProps {}

const FeatureCard: React.FC<{ icon: React.ReactElement; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 h-full">
        <div className="bg-[#00FFC2]/10 text-[#00FFC2] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            {React.cloneElement<{ className?: string }>(icon, { className: 'w-6 h-6' })}
        </div>
        <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{ step: number; title: string; description: string }> = ({ step, title, description }) => (
    <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-900/50 border border-white/10 rounded-full font-bold text-lg text-[#00FFC2]">
            {step}
        </div>
        <div>
            <h4 className="font-bold text-lg text-white mb-1">{title}</h4>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; avatar: string }> = ({ quote, name, role, avatar }) => (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full flex flex-col justify-between">
        <p className="text-gray-300 italic">"{quote}"</p>
        <div className="flex items-center mt-6">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover mr-4"/>
            <div>
                <p className="font-bold text-white">{name}</p>
                <p className="text-sm text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);

const SocialProofLogos: React.FC = () => {
    const icons = [
        { Icon: InstagramIcon, name: 'Instagram' },
        { Icon: FacebookIcon, name: 'Meta' },
        { Icon: LinkedInIcon, name: 'LinkedIn' },
        { Icon: TikTokIcon, name: 'TikTok' },
        { Icon: YouTubeIcon, name: 'YouTube' },
        { Icon: PinterestIcon, name: 'Pinterest' }
    ];

    return (
        <div className="mt-12">
            <p className="text-center text-sm text-gray-500 font-medium mb-6">USED BY PROFESSIONALS AT:</p>
            <div className="flex justify-center items-center space-x-6 sm:space-x-8 md:space-x-12 opacity-60 grayscale flex-wrap">
                {icons.map(({ Icon, name }) => (
                    <Icon key={name} className="h-6 md:h-7 text-gray-400" title={name}/>
                ))}
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = () => {
    return (
        <div className="relative bg-[#0D1117] text-gray-200 font-sans overflow-x-hidden">
            <ParticleNetwork />
            <div className="relative z-10">
                <Navbar />

                <main>
                    {/* Hero Section */}
                    <section className="min-h-screen flex items-center justify-center pt-24 pb-16 text-center">
                        <div className="container mx-auto px-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter leading-tight mb-6 animate-fade-in-down">
                                Spend your time <span className="bg-gradient-to-r from-[#00FFC2] to-sky-400 bg-clip-text text-transparent">closing deals</span>, not chasing unqualified leads.
                                <br />
                                Let our AI do the <span className="bg-gradient-to-r from-[#00FFC2] to-sky-400 bg-clip-text text-transparent">filtering for you</span>.
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-100">
                                SAHA AI automatically qualifies leads, handles replies and follow-ups, and updates your CRM without any manual work.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-200">
                                <Link to="/register" className="w-full sm:w-auto px-8 py-4 text-base font-bold text-black bg-[#00FFC2] rounded-lg hover:bg-teal-300 transition-transform hover:scale-105 duration-300 shadow-[0_0_20px_theme(colors.teal.400/60%)]">
                                    Get Started for Free
                                </Link>
                                <button className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-transparent border-2 border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-300">
                                    View Demo
                                </button>
                            </div>
                            <div className="animate-fade-in-up delay-300">
                                <SocialProofLogos />
                            </div>
                        </div>
                    </section>

                    {/* Core Features Section */}
                    <section id="features" className="py-16 md:py-24 bg-black/20">
                        <div className="container mx-auto px-4">
                             <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Your Social Media Co-Pilot</h2>
                                <p className="text-gray-400 mt-3 max-w-xl mx-auto">
                                    SAHA AI is packed with features to save you time and supercharge your growth.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <FeatureCard 
                                    icon={<ScheduleIcon />}
                                    title="Multi-Platform Publishing"
                                    description="Upload your media once, then schedule or publish it across Instagram, Facebook, LinkedIn, and more with a single click."
                                />
                                <FeatureCard 
                                    icon={<SparklesIcon />}
                                    title="AI Caption Generator"
                                    description="Never run out of ideas. Generate engaging captions, hashtags, and post concepts instantly with our advanced AI assistant."
                                />
                                <FeatureCard 
                                    icon={<ConversationIcon />}
                                    title="Smart Engagement AI"
                                    description="Automatically reply to comments and DMs with a human-like touch. Convert inquiries into leads 24/7."
                                />
                                <FeatureCard 
                                    icon={<MicrophoneIcon />}
                                    title="AI Voice Agent"
                                    description="A 24/7 intelligent voice assistant for your website that answers questions, qualifies visitors, and captures leads instantly."
                                />
                            </div>
                        </div>
                    </section>
                    
                    {/* AI Voice Website Widget Feature Showcase */}
                    <section className="py-16 md:py-24 border-b border-white/5">
                        <div className="container mx-auto px-4">
                            {/* Mobile Title (visible on mobile only) */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 lg:hidden">
                                AI Voice Website Widget
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Left Side: Text Content */}
                                <div className="order-2 lg:order-1 animate-fade-in-up">
                                    {/* Desktop Title (hidden on mobile) */}
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 hidden lg:block">
                                        AI Voice Website Widget
                                    </h2>
                                    <h3 className="text-xl font-semibold text-[#00FFC2] mb-4">
                                        Let visitors speak with your AI agent directly on your website.
                                    </h3>
                                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                        Our AI Voice Agent is available 24/7 on your website to answer questions, collect lead details, send property information, and guide users automatically. It helps you convert visitors into leads without manual effort.
                                    </p>
                                    
                                    <ul className="space-y-4">
                                        {[
                                            "24/7 website voice assistant",
                                            "Answers all questions in real time",
                                            "Collects and saves all incoming leads",
                                            "Sends property details automatically",
                                            "Supports all languages",
                                            "Works on any device"
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="bg-[#00FFC2]/10 rounded-full p-1 mr-3 mt-0.5">
                                                    <CheckCircleIcon className="w-5 h-5 text-[#00FFC2]" />
                                                </div>
                                                <span className="text-gray-300 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Right Side: Video Embed (Browser Mockup) */}
                                <div className="order-1 lg:order-2 animate-fade-in-up delay-200 flex justify-center w-full">
                                    <div className="relative w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(0,255,194,0.1)] bg-gray-900 group">
                                        {/* Browser Header Mockup */}
                                        <div className="bg-gray-800/80 backdrop-blur-md border-b border-white/10 p-3 flex items-center space-x-2">
                                            <div className="flex space-x-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                            </div>
                                            <div className="ml-4 flex-1 bg-gray-900/50 rounded-md h-6 max-w-xs mx-auto flex items-center px-3 text-[10px] text-gray-500">
                                                sahaai.io/voice-agent
                                            </div>
                                        </div>
                                        
                                        <div className="aspect-video relative bg-black">
                                            <video
                                                src="https://res.cloudinary.com/ddeaazrgb/video/upload/cursorful-video-1763975478768_ymih7n.mp4"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Auto-Personalized Sending Feature Showcase */}
                    <section className="py-16 md:py-24">
                        <div className="container mx-auto px-4">
                            {/* Mobile Title (visible on mobile only) */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 lg:hidden">
                                Auto-Personalized Sending
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Left Side: Text Content */}
                                <div className="order-2 lg:order-1 animate-fade-in-up">
                                    {/* Desktop Title (hidden on mobile) */}
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 hidden lg:block">
                                        Auto-Personalized Sending
                                    </h2>
                                    <h3 className="text-xl font-semibold text-[#00FFC2] mb-4">
                                        This feature automatically collects each user’s requirements and builds a personalized property package for them—across Instagram, Facebook, and WhatsApp.
                                    </h3>
                                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                        It analyzes what the user is looking for, finds the best-matching properties, and instantly sends tailored messages, property details, brochures, and media without any manual work.
                                    </p>
                                    
                                    <ul className="space-y-4">
                                        {[
                                            "Personalized property search",
                                            "Smart property matching",
                                            "Auto-assembled media & brochures",
                                            "Instant delivery across WhatsApp, Instagram, and Facebook"
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="bg-[#00FFC2]/10 rounded-full p-1 mr-3 mt-0.5">
                                                    <CheckCircleIcon className="w-5 h-5 text-[#00FFC2]" />
                                                </div>
                                                <span className="text-gray-300 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Right Side: Seamless Video Embed (Reels Style) */}
                                <div className="order-1 lg:order-2 animate-fade-in-up delay-200 flex justify-center w-full">
                                    <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border-4 border-gray-800 shadow-[0_0_50px_-12px_rgba(0,255,194,0.15)] bg-gray-900 group">
                                         {/* Gradient Overlay for subtle depth */}
                                         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-10"></div>
                                         <video
                                            src="https://res.cloudinary.com/ddeaazrgb/video/upload/ScreenRecording_11-23-2025_00-18-56_1_oysmab.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover block"
                                        />
                                        {/* Optional Reflection */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Auto-Commenting DM Redirect Feature Showcase */}
                    <section className="py-16 md:py-24 bg-black/20">
                        <div className="container mx-auto px-4">
                            {/* Mobile Title (visible on mobile only) */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 lg:hidden">
                                Auto-Commenting DM Redirect
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Right Side: Text Content */}
                                <div className="order-2 lg:order-2 animate-fade-in-up">
                                    {/* Desktop Title (hidden on mobile) */}
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 hidden lg:block">
                                        Auto-Commenting DM Redirect
                                    </h2>
                                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                        This feature automatically replies to comments on your posts and asks users to DM you for more details. This moves conversations into your inbox, where the AI can collect information, qualify leads, and continue the conversation automatically.
                                    </p>
                                    
                                    <ul className="space-y-4">
                                        {[
                                            "Replies instantly to every comment",
                                            "Encourages users to DM for more info",
                                            "Converts comments into qualified leads",
                                            "Fully automated across major platforms"
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="bg-sky-500/10 rounded-full p-1 mr-3 mt-0.5">
                                                    <CheckCircleIcon className="w-5 h-5 text-sky-400" />
                                                </div>
                                                <span className="text-gray-300 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Left Side: Seamless Video Embed (Reels Style) */}
                                <div className="order-1 lg:order-1 animate-fade-in-up delay-200 flex justify-center w-full">
                                    <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border-4 border-gray-800 shadow-[0_0_50px_-12px_rgba(56,189,248,0.15)] bg-gray-900 group">
                                         {/* Gradient Overlay for subtle depth */}
                                         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-10"></div>
                                         <video
                                            src="https://res.cloudinary.com/ddeaazrgb/video/upload/2025-11-23_19_15_11_video_tzepc9.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover block"
                                        />
                                        {/* Optional Reflection */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section id="how-it-works" className="py-16 md:py-24">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Get Started in 3 Simple Steps</h2>
                            </div>
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                                <HowItWorksStep step={1} title="Connect Accounts" description="Securely link your social media profiles from Meta, LinkedIn, and more in seconds."/>
                                <HowItWorksStep step={2} title="Add Content" description="Upload your media to our visual calendar and let our AI help you craft the perfect post."/>
                                <HowItWorksStep step={3} title="Automate & Grow" description="Schedule your content, and let SAHA AI handle the publishing and engagement while you focus on your business."/>
                            </div>
                        </div>
                    </section>
                    
                    {/* Pricing Section */}
                    <section id="pricing" className="py-16 md:py-24 bg-black/20">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Choose a Plan That's Right for You</h2>
                            <p className="text-gray-400 mt-3 max-w-xl mx-auto mb-12">
                                Start for free, then upgrade as you grow. No hidden fees, cancel anytime.
                            </p>
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-2">Flexible Pricing for Teams of All Sizes</h3>
                                    <p className="text-gray-400 mb-6">From solo creators to large agencies, we have a plan that fits your needs.</p>
                                     <Link to="/pricing" className="font-bold text-white bg-transparent border-2 border-[#00FFC2] rounded-lg px-6 py-3 hover:bg-[#00FFC2] hover:text-black transition-colors duration-300">
                                        Compare Plans
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section id="testimonials" className="py-16 md:py-24">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Loved by Creators and Businesses</h2>
                            </div>
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                <TestimonialCard 
                                    quote="SAHA AI saves me 3 hours a day. My social media runs by itself now."
                                    name="Aisha Khan"
                                    role="Real Estate Agent"
                                    avatar="https://randomuser.me/api/portraits/women/44.jpg"
                                />
                                <TestimonialCard 
                                    quote="Replying to comments and leads used to be painful. Now it's automatic and our response time is instant."
                                    name="Abin Thomas"
                                    role="Digital Marketer"
                                    avatar="https://randomuser.me/api/portraits/men/32.jpg"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Final CTA */}
                    <section className="py-16 md:py-24 bg-black/20">
                         <div className="container mx-auto px-4 text-center">
                             <div className="max-w-3xl mx-auto bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-3xl p-6 sm:p-10 border border-white/10">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to automate your social media?</h2>
                                <p className="text-gray-300 mb-8">
                                    Start using SAHA AI today — it takes less than 60 seconds to sign up.
                                </p>
                                 <Link to="/register" className="px-8 py-4 text-base font-bold text-black bg-[#00FFC2] rounded-lg hover:bg-teal-300 transition-transform hover:scale-105 duration-300 shadow-[0_0_20px_theme(colors.teal.400/60%)]">
                                    Sign Up Free
                                 </Link>
                             </div>
                         </div>
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
