
import * as React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleNetwork from './ParticleNetwork';

const AboutPage: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#0D1117] text-white font-sans overflow-x-hidden selection:bg-[#00FFC2] selection:text-black">
            <ParticleNetwork />
            
            {/* Ambient Background Lighting */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#00FFC2]/5 rounded-full blur-[120px]" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                <main className="flex-grow flex items-center justify-center relative pt-24 pb-12 lg:pt-0 lg:pb-0">
                    <div className="container mx-auto px-6 md:px-12 relative z-20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                            
                            {/* Left Content - 7 Cols */}
                            <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
                                <div>
                                    <h2 className="text-[#00FFC2] font-bold tracking-widest uppercase text-xs mb-4">About The Founder</h2>
                                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                                        Founder & Creator of <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFC2] to-sky-400">
                                            SAHA AI
                                        </span>
                                    </h1>
                                </div>

                                <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-light max-w-2xl">
                                    <p>
                                        I’m <span className="text-white font-medium">Shaheel Ahamed</span>, an automation architect passionate about building intelligent systems that help businesses scale effortlessly. Over the years, I’ve focused on designing automation products that feel intuitive, powerful, and beautifully engineered. With SAHA AI, my mission is to bring enterprise-level automation to every creator, agent, and business owner.
                                    </p>
                                    <p>
                                        My work is driven by one goal: using AI to remove manual workloads so people can focus on what truly matters. SAHA AI automates social media, conversations, leads, CRM updates, and customer engagement—giving teams the freedom to grow faster without extra effort.
                                    </p>
                                </div>
                            </div>

                            {/* Right Image - 5 Cols */}
                            <div className="lg:col-span-5 relative h-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
                                <div className="relative w-full max-w-md lg:max-w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFC2]/10 to-blue-600/10 z-10 pointer-events-none mix-blend-overlay"></div>
                                    <img 
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" 
                                        alt="Shaheel Ahamed" 
                                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[10%] group-hover:grayscale-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Big Footer Name - Positioned absolutely at bottom */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0">
                        <h1 className="text-[13vw] font-black text-white/[0.03] leading-none tracking-tighter text-center whitespace-nowrap transform translate-y-[30%]">
                            Shaheel Ahamed
                        </h1>
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
