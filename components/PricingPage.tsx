// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';
import { getCalApi } from '@calcom/embed-react';
import ParticleNetwork from './ParticleNetwork';
import Navbar from './Navbar';
import Footer from './Footer';
import { CheckCircleIcon } from './icons';

const featureList = [
    'Publish to all major platforms (Instagram, Facebook, LinkedIn, TikTok, YouTube, X, Threads)',
    'Auto-reply to comments (Instagram, Facebook, Threads)',
    'Auto-respond to inbox messages (Instagram + Facebook)',
    'Auto-qualify incoming leads',
    'Automatically send property images to users',
    'Automatically send brochures',
    'Automatically book calls with qualified leads',
    'Email marketing automations',
    'Voice agent that attends all calls',
    'Multilingual voice assistant (supports all languages)',
    'Website widget with voice assistant response',
    'Smart CRM updates',
    'Property matching assistant',
    'AI-driven lead scoring',
    'Auto-categorization of leads',
    'Real-time analytics dashboard',
    '24/7 AI automation'
];

const PlanCard: React.FC<{ planName: string; description: string; features: string[]; isPopular?: boolean; }> = ({ planName, description, features, isPopular }) => (
    <div className={`relative bg-gray-900/50 backdrop-blur-xl border rounded-2xl p-8 flex flex-col transition-all duration-300 ${isPopular ? 'shadow-2xl shadow-teal-500/10 border-teal-500/50 lg:-translate-y-4' : 'border-white/10 hover:border-white/20 hover:-translate-y-1'}`}>
        {isPopular && (
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-[#00FFC2] to-sky-400 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Recommended
            </div>
        )}
        <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{planName}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
        
        <ul className="space-y-4 text-sm flex-1 mb-8">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
        
        <button 
            data-cal-namespace="30min"
            data-cal-link="shaheel-saha/30min"
            data-cal-config='{"layout":"month_view"}'
            className={`w-full text-center block mt-auto px-6 py-3 text-base font-bold rounded-lg transition-all duration-300 ${isPopular ? 'text-black bg-gradient-to-r from-[#00FFC2] to-sky-400 hover:opacity-90 shadow-lg shadow-teal-400/30' : 'text-white bg-gray-700 hover:bg-gray-600'}`}
        >
            Schedule a Call
        </button>
    </div>
);


const PricingPage: React.FC = () => {
    React.useEffect(() => {
        (async function () {
          const cal = await getCalApi({"namespace":"30min"});
          cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
        })();
      }, []);

    return (
        <div className="relative bg-[#0D1117] text-gray-200 font-sans overflow-x-hidden">
            <ParticleNetwork />
            <div className="relative z-10">
                <Navbar />
                <main className="pt-24 pb-16">
                    <section className="container mx-auto px-4 py-16">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in-down">
                                Simple, Powerful Plans
                            </h1>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-100">
                                Unlock powerful automation with a plan that scales with you. No hidden fees, just results.
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-y-12 lg:gap-x-8 items-stretch">
                            <PlanCard 
                                planName="Starter"
                                description="Free for the first 30 days"
                                features={featureList}
                            />
                            <PlanCard 
                                planName="Professional"
                                description="Full Automation"
                                features={featureList}
                                isPopular={true}
                            />
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default PricingPage;