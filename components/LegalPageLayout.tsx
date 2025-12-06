



// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';

const Logo: React.FC = () => (
    <div className="flex items-center">
        <img src="https://res.cloudinary.com/ddeaazrgb/image/upload/v1763392782/logo.png" alt="Logo" className="h-28 w-auto mr-3" />
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">SAHA AI</h1>
    </div>
);

const LegalPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="bg-[#0D1117] min-h-screen font-sans text-gray-300">
            <style>{`
                .legal-content h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #374151; /* gray-700 */
                    padding-bottom: 0.5rem;
                    color: #f3f4f6; /* gray-100 */
                }
                .legal-content p {
                    line-height: 1.75;
                    margin-bottom: 1.25rem;
                    color: #9ca3af; /* gray-400 */
                }
                .legal-content ul {
                    list-style-type: disc;
                    padding-left: 2rem;
                    margin-bottom: 1.25rem;
                    color: #9ca3af; /* gray-400 */
                }
                 .legal-content li {
                    margin-bottom: 0.5rem;
                }
                .legal-content a {
                    color: #00FFC2; /* teal-400 */
                }
                .legal-content a:hover {
                    text-decoration: underline;
                }
            `}</style>
            <header className="bg-[#0D1117]/70 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <a href="/"><Logo /></a>
                    <a href="/" className="px-4 py-2 text-sm font-semibold text-black bg-[#00FFC2] rounded-lg hover:bg-teal-300 transition-colors">
                        Back to Home
                    </a>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-gray-900/50 p-8 sm:p-12 rounded-2xl border border-white/10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">{title}</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="legal-content">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LegalPageLayout;