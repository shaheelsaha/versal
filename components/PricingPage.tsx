// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';
import ParticleNetwork from './ParticleNetwork';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
    UserIcon, 
    EmailIcon, 
    PhoneIcon, 
    BuildingOfficeIcon, 
    CalendarIcon, 
    ClockIcon, 
    SpinnerIcon, 
    CheckCircleIcon,
    AnalyticsIcon,
    ScheduleIcon,
    ConversationIcon
} from './icons';

const PricingPage: React.FC = () => {
    const [formState, setFormState] = React.useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        date: '',
        time: '',
        goals: ''
    });
    const [submissionStatus, setSubmissionStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
    const [error, setError] = React.useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionStatus('submitting');
        setError(null);

        try {
            // Using a new webhook endpoint for scheduling calls
            const response = await fetch('https://n8n.sahaai.online/webhook/schedule-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                throw new Error('Failed to book the call. Please try again later.');
            }

            setSubmissionStatus('success');
            setFormState({ name: '', email: '', phone: '', businessName: '', date: '', time: '', goals: '' });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setSubmissionStatus('idle');
        }
    };

    return (
        <div className="relative bg-[#0D1117] text-gray-200 font-sans overflow-x-hidden">
            <ParticleNetwork />
            <div className="relative z-10">
                <Navbar />
                <main className="pt-24 pb-16">
                    <section className="container mx-auto px-4 py-16">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in-down">
                                Let’s Help You Automate Your Business
                            </h1>
                            <p className="text-lg text-gray-400 max-w-3xl mx-auto animate-fade-in-up delay-100">
                                Schedule a free 1:1 call and explore how SAHA AI can automate your social media, lead qualification, and customer engagement.
                            </p>
                        </div>

                        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                            {/* Booking Form */}
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-fade-in-up delay-200">
                                {submissionStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center text-center h-full min-h-[480px]">
                                        <CheckCircleIcon className="w-20 h-20 text-green-400 mb-6"/>
                                        <h3 className="text-3xl font-bold text-white mb-3">Your call is booked!</h3>
                                        <p className="text-gray-300 max-w-sm">Thank you for scheduling a call with us. Our team will contact you shortly to confirm the details.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {error && (
                                            <div className="p-3 text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg">
                                                {error}
                                            </div>
                                        )}
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                                                <input type="text" id="name" name="name" value={formState.name} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300"/>
                                            </div>
                                             <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                                                <input type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300"/>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                                                <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300"/>
                                            </div>
                                             <div>
                                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-1.5">Business Name <span className="text-gray-500">(Optional)</span></label>
                                                <input type="text" id="businessName" name="businessName" value={formState.businessName} onChange={handleInputChange} className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300"/>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Date</label>
                                                <input type="date" id="date" name="date" value={formState.date} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300" style={{ colorScheme: 'dark' }} />
                                            </div>
                                             <div>
                                                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Time</label>
                                                <input type="time" id="time" name="time" value={formState.time} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300" style={{ colorScheme: 'dark' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="goals" className="block text-sm font-medium text-gray-300 mb-1.5">Tell us about your goals</label>
                                            <textarea id="goals" name="goals" rows={4} value={formState.goals} onChange={handleInputChange} required className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition duration-300"></textarea>
                                        </div>
                                        <div>
                                            <button type="submit" disabled={submissionStatus === 'submitting'} className="w-full mt-2 flex justify-center items-center px-6 py-3 text-base font-bold text-black bg-gradient-to-r from-[#00FFC2] to-sky-400 rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-teal-400/30 disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed">
                                                {submissionStatus === 'submitting' ? (
                                                    <>
                                                        <SpinnerIcon className="w-5 h-5 mr-3 animate-spin" />
                                                        Scheduling...
                                                    </>
                                                ) : 'Schedule My Call'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Visual Element */}
                            <div className="hidden lg:block animate-fade-in-up delay-300">
                                <div className="bg-gray-900/30 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent"></div>
                                     <div className="relative z-10">
                                        <div className="bg-[#00FFC2]/10 text-[#00FFC2] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                                            <AnalyticsIcon className="w-6 h-6"/>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Your All-in-One Automation Hub</h3>
                                        <p className="text-gray-400 mb-6">From first comment to final sale, SAHA AI handles the entire customer journey, so you can focus on growth.</p>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-start p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                                                <ScheduleIcon className="w-6 h-6 text-sky-400 mt-1 mr-4"/>
                                                <div>
                                                    <h4 className="font-semibold text-gray-200">Social Media Automation</h4>
                                                    <p className="text-sm text-gray-400">Auto-publish content and manage comments across all your platforms.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                                                <ConversationIcon className="w-6 h-6 text-purple-400 mt-1 mr-4"/>
                                                <div>
                                                    <h4 className="font-semibold text-gray-200">AI Lead Qualification</h4>
                                                    <p className="text-sm text-gray-400">Instantly qualify leads from comments and DMs, 24/7.</p>
                                                </div>
                                            </div>
                                             <div className="flex items-start p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                                                <EmailIcon className="w-6 h-6 text-red-400 mt-1 mr-4"/>
                                                <div>
                                                    <h4 className="font-semibold text-gray-200">Automated Follow-ups</h4>
                                                    <p className="text-sm text-gray-400">Engage leads with automated property info, emails, and call booking.</p>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default PricingPage;
