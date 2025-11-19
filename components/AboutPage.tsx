
// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#0D1117] text-white font-sans overflow-x-hidden selection:bg-[#00FFC2] selection:text-black">
            {/* Soft Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#00FFC2]/5 rounded-full blur-[120px] transform translate-x-1/3 -translate-y-1/4" />
                 <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[150px] transform -translate-x-1/3 translate-y-1/4" />
            </div>

            <div className="relative z-10">
                <Navbar />
                
                <main className="pt-32 lg:pt-40 pb-0 min-h-screen flex flex-col">
                    <div className="container mx-auto px-6 md:px-12 flex-grow flex flex-col justify-center">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-12">
                            
                            {/* Left Content */}
                            <div className="lg:col-span-7 flex flex-col space-y-8 lg:space-y-12 z-10 pt-4">
                                <div className="space-y-4">
                                    <h2 className="text-[#00FFC2] font-semibold tracking-widest uppercase text-sm">About The Founder</h2>
                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                                        Founder & Creator of <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFC2] to-sky-400">
                                            SAHA AI
                                        </span>
                                    </h1>
                                </div>

                                <div className="space-y-8 max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed font-light">
                                    <p>
                                        I’m <span className="text-white font-medium">Shaheel Ahamed</span>, an automation architect passionate about building intelligent systems that help businesses scale effortlessly. Over the years, I’ve focused on designing automation products that feel intuitive, powerful, and beautifully engineered. With SAHA AI, my mission is to bring enterprise-level automation to every creator, agent, and business owner.
                                    </p>
                                    <p>
                                        My work is driven by one goal: using AI to remove manual workloads so people can focus on what truly matters. SAHA AI automates social media, conversations, leads, CRM updates, and customer engagement—giving teams the freedom to grow faster without extra effort.
                                    </p>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="lg:col-span-5 relative lg:h-auto flex justify-center lg:justify-end items-start z-10">
                                <div className="relative w-full max-w-md lg:max-w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFC2]/10 to-purple-500/10 mix-blend-overlay z-20 pointer-events-none"></div>
                                    {/* Founder Image */}
                                    <img 
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" 
                                        alt="Shaheel Ahamed" 
                                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Large Footer Name */}
                        <div className="mt-auto overflow-hidden w-full">
                            <h1 className="text-[13vw] sm:text-[14vw] font-black text-white/[0.03] leading-[0.8] tracking-tighter text-center lg:text-left whitespace-nowrap select-none pointer-events-none transform translate-y-[5%]">
                                Shaheel Ahamed
                            </h1>
                        </div>
                    </div>
                </main>

                <div className="bg-[#0D1117] relative z-20 border-t border-white/5">
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AboutPage;