
import * as React from 'react';
import { db, storage } from '../firebaseConfig';
import firebase from '../firebaseConfig';
import { Property } from '../types';
import { 
    PlusIcon, EditIcon, TrashIcon, XIcon, SpinnerIcon, 
    UploadIcon, BuildingOfficeIcon, LocationIcon, 
    CurrencyDollarIcon, BedIcon, BathIcon, AreaIcon, 
    LinkIcon, SparklesIcon, CheckCircleIcon,
    DownloadIcon, TagIcon
} from './icons';

interface KnowledgeProps {
    user: any;
}

// Helper to send webhook for property sync
const sendPropertyWebhook = async (property: Property, action: 'create' | 'update' | 'delete') => {
    try {
        await fetch('https://n8n.sahaai.online/webhook/property-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...property, action })
        });
    } catch (e) { 
        console.error("Webhook failed", e); 
    }
};

// --- Preview Components ---

const DetailItem: React.FC<{ icon: React.ReactElement; label: string; value?: React.ReactNode }> = ({ icon, label, value }) => (
    <li className="flex items-center text-gray-100">
        {React.cloneElement<{ className?: string }>(icon, { className: 'w-5 h-5 text-gray-400 mr-3 flex-shrink-0' })}
        <span className="font-medium">{label}</span>
        {value && <span className="ml-2 text-gray-300">{value}</span>}
    </li>
);

const PropertyPreviewCard: React.FC<{ property: Partial<Property> }> = ({ property }) => {
    const formattedPrice = new Intl.NumberFormat(property.currency === 'USD' ? 'en-US' : 'en-AE', {
      style: 'currency',
      currency: property.currency || 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(property.price) || 0);
  
    const {
        title = 'Property Title',
        location = 'Location',
        bedrooms = 0,
        bathrooms = 0,
        area = 0,
        imageUrl,
        propertyLink,
        status = 'For Sale',
      } = property;

    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-sm mx-auto font-sans h-full flex flex-col overflow-hidden">
        <div className="h-48 bg-gray-700 relative">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <BuildingOfficeIcon className="w-12 h-12 opacity-50" />
                </div>
            )}
            <div className="absolute top-3 right-3">
                 <span className={`px-2 py-1 rounded text-xs font-bold shadow-md ${
                     status === 'Sold' || status === 'Rented' 
                     ? 'bg-red-500/90 text-white' 
                     : 'bg-[#00FFC2]/90 text-black'
                 }`}>
                     {status}
                 </span>
            </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
            <div>
                <h3 className="text-base font-semibold text-gray-100 leading-tight">
                    {title || 'Property Title'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">propertyfinder.ae</p>
            </div>
            <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600/80 rounded-lg flex-1">
                <ul className="space-y-3 text-sm">
                    <DetailItem icon={<TagIcon />} label={status} />
                    <DetailItem icon={<LocationIcon />} label={location || "Location"} />
                    <li className="flex items-center text-gray-100 font-medium flex-wrap">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <span>{formattedPrice}</span>
                        <span className="text-gray-600 mx-2.5">|</span>
                        <BedIcon className="w-5 h-5 text-gray-400 mr-1.5 flex-shrink-0" />
                        <span>{bedrooms} bed</span>
                        <span className="text-gray-600 mx-2.5">|</span>
                        <BathIcon className="w-5 h-5 text-gray-400 mr-1.5 flex-shrink-0" />
                        <span>{bathrooms} bath</span>
                    </li>
                    <DetailItem icon={<AreaIcon />} label={`${area} sqft`} />
                    <li className="flex items-center text-gray-100">
                        <LinkIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <a href={propertyLink || '#'} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline text-xs truncate max-w-[150px]">
                            {propertyLink || 'No link provided'}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    );
};

const BlueprintPreviewCard: React.FC<{ 
    imageUrl?: string, 
    isGenerating: boolean, 
    progress?: number,
    onFullView?: (url: string) => void,
    onDownload?: (url: string) => void
}> = ({ imageUrl, isGenerating, progress = 0, onFullView, onDownload }) => {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-sm mx-auto font-sans h-full flex flex-col p-4 items-center justify-center text-center">
            {isGenerating ? (
                <div className="flex flex-col items-center w-full max-w-xs px-2">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#00FFC2] animate-spin" style={{ animationDuration: '1s' }}></div>
                        <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-[#00FFC2] animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Generating 3D Model...</h3>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2 relative overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-teal-400 to-[#00FFC2] h-2 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${Math.round(progress)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full text-xs text-gray-400 font-mono">
                        <span>Processing</span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 max-w-[240px] leading-relaxed">
                        Our AI is converting your blueprint into a photorealistic 3D isometric render. This takes about 50 seconds.
                    </p>
                </div>
            ) : imageUrl ? (
                <div className="w-full h-full flex flex-col group relative">
                    <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-600 bg-black">
                        <img 
                            src={imageUrl} 
                            alt="Generated 3D Model" 
                            className="w-full h-full object-contain"
                        />
                        {/* Overlay with buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                            {onFullView && (
                                <button 
                                    onClick={() => onFullView(imageUrl)} 
                                    type="button"
                                    className="p-2 bg-gray-800 text-white rounded-full hover:bg-[#00FFC2] hover:text-black transition-colors shadow-lg border border-white/10"
                                    title="Full View"
                                >
                                    <AreaIcon className="w-5 h-5" /> 
                                </button>
                            )}
                            {onDownload && (
                                <button 
                                    onClick={() => onDownload(imageUrl)} 
                                    type="button"
                                    className="p-2 bg-gray-800 text-white rounded-full hover:bg-[#00FFC2] hover:text-black transition-colors shadow-lg border border-white/10"
                                    title="Download"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 text-left">
                        <h4 className="text-white font-semibold flex items-center">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
                            3D Render Complete
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                            This high-quality isometric view is ready to be saved with your property.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-gray-500 opacity-60">
                    <BuildingOfficeIcon className="w-16 h-16 mb-4" />
                    <p className="text-sm">Upload a blueprint to generate a 3D view.</p>
                </div>
            )}
        </div>
    );
}

// --- Loading Card Component ---
const SavingPropertyCard: React.FC = () => (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full h-full min-h-[400px] flex flex-col overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-700"></div>
        <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="flex-1 bg-gray-700/50 rounded-lg"></div>
            <div className="flex items-center justify-center text-[#00FFC2] text-sm font-semibold">
                <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                Saving Property...
            </div>
        </div>
    </div>
);

// --- Main Editor Component ---

interface PropertyEditorProps {
    user: any;
    property?: Property | null;
    onClose: () => void;
    onSave: (data: Partial<Property>, imageFile: File | null, blueprintBlob: Blob | null) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ user, property, onClose, onSave }) => {
    const formRef = React.useRef<HTMLFormElement>(null);
    const [formData, setFormData] = React.useState<Partial<Property>>({
        title: '',
        location: '',
        price: 0,
        currency: 'AED',
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        propertyType: 'Apartment',
        status: 'For Sale',
        plan: '1 BHK',
        propertyLink: '',
        imageUrl: '',
        blueprint3DUrl: ''
    });
    
    // UI State
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const [activePreview, setActivePreview] = React.useState<'property' | 'blueprint'>('property');
    const [fullViewUrl, setFullViewUrl] = React.useState<string | null>(null);
    
    // Generation State
    const [isGenerating3D, setIsGenerating3D] = React.useState(false);
    const [generationProgress, setGenerationProgress] = React.useState(0);
    const [blueprintBlob, setBlueprintBlob] = React.useState<Blob | null>(null);

    React.useEffect(() => {
        if (property) {
            setFormData(property);
            setImagePreviewUrl(property.imageUrl || null);
        }
    }, [property]);

    React.useEffect(() => {
        return () => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleBlueprintUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Limit size to 10MB
            if (file.size > 10 * 1024 * 1024) {
                alert("File too large. Max 10MB.");
                e.target.value = '';
                return;
            }

            setIsGenerating3D(true);
            setActivePreview('blueprint');
            setGenerationProgress(0);

            // Simulation: 0 -> 100% over 50 seconds (approx)
            // 50s = 50000ms. Update every 500ms => 100 steps.
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 95) return 95; // hold at 95 until done
                    return prev + 1;
                });
            }, 500);

            try {
                // 1. Convert input file to Base64 for webhook payload
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.includes(',') ? result.split(',')[1] : result;
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // 2. Call Webhook
                const response = await fetch('https://n8n.sahaai.online/webhook/2d', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: base64Data,
                        details: {
                            type: formData.propertyType,
                            bedrooms: formData.bedrooms,
                            area: formData.area
                        }
                    })
                });

                if (!response.ok) throw new Error("Webhook generation failed");

                // 3. Handle Binary Response (Blob)
                const blob = await response.blob();
                setBlueprintBlob(blob); // Store blob for saving later
                
                // Create URL for preview
                const previewUrl = URL.createObjectURL(blob);
                
                clearInterval(progressInterval);
                setGenerationProgress(100);
                
                setFormData(prev => ({ ...prev, blueprint3DUrl: previewUrl }));

            } catch (error) {
                console.error("3D Generation Error:", error);
                alert("Failed to generate 3D model. Please try again.");
                setGenerationProgress(0);
            } finally {
                clearInterval(progressInterval);
                setIsGenerating3D(false);
                e.target.value = '';
            }
        }
    };

    const handleDownloadBlueprint = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `blueprint-3d-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current?.reportValidity()) return;
        
        // Pass data to parent for background saving
        onSave(formData, imageFile, blueprintBlob);
    };

    // Live preview data merging
    const livePreviewData = { 
        ...formData, 
        imageUrl: imagePreviewUrl || formData.imageUrl,
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white">{property ? 'Edit Property' : 'Add New Property'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>
                
                {/* Content: Split Layout */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    
                    {/* Left: Form */}
                    <form ref={formRef} className="flex-1 flex flex-col overflow-y-auto border-r border-white/5 bg-gray-900">
                        <div className="p-6 space-y-6">
                            
                            {/* Standard Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                                <div className="relative">
                                    <LocationIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                                </div>
                            </div>

                            {/* Property Image Upload */}
                            <div className="border-t border-gray-800 pt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Property Image</label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                    {imagePreviewUrl ? (
                                        <div className="relative group w-full max-w-[200px]">
                                            <img src={imagePreviewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreviewUrl(null); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <XIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadIcon className="w-10 h-10 text-gray-500 mb-2"/>
                                            <label className="cursor-pointer">
                                                <span className="text-[#00FFC2] font-semibold hover:underline">Upload a file</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Blueprint to 3D Upload */}
                            <div className="border-t border-gray-800 pt-4">
                                <div className="flex items-center mb-2">
                                    <SparklesIcon className="w-4 h-4 text-[#00FFC2] mr-2" />
                                    <label className="block text-sm font-medium text-white">Blueprint to 3D</label>
                                </div>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                                    {isGenerating3D ? (
                                        <div className="flex flex-col items-center justify-center py-2">
                                            <SpinnerIcon className="w-8 h-8 text-[#00FFC2] animate-spin mb-2" />
                                            <p className="text-sm text-gray-300">Generating 3D model...</p>
                                        </div>
                                    ) : formData.blueprint3DUrl ? (
                                        <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                                            <div className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-white">Blueprint Generated</p>
                                                    <p className="text-xs text-gray-400">Ready to view in preview panel</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => {
                                                setFormData(p => ({...p, blueprint3DUrl: ''}));
                                                setBlueprintBlob(null);
                                            }} className="text-gray-400 hover:text-red-400">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <label className="cursor-pointer inline-flex flex-col items-center">
                                                <span className="text-[#00FFC2] font-semibold text-sm hover:underline">Upload Blueprint</span>
                                                <span className="text-xs text-gray-500 mt-1">Upload 2D floorplan to generate 3D view</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleBlueprintUpload} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Property Link</label>
                                <input type="url" name="propertyLink" value={formData.propertyLink} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-gray-400 mb-1">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div>
                                <div><label className="block text-xs text-gray-400 mb-1">Area (sqft)</label><input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div>
                                <div><label className="block text-xs text-gray-400 mb-1">Bedrooms</label><input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div>
                                <div><label className="block text-xs text-gray-400 mb-1">Bathrooms</label><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" /></div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm">
                                        {['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm">
                                        {['For Sale', 'For Rent', 'Sold', 'Rented'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Right: Preview Panel */}
                    <div className="bg-[#0D1117] p-6 hidden md:flex flex-col items-center justify-start overflow-hidden relative border-l border-white/5">
                        
                        {/* Tabs */}
                        <div className="bg-gray-800 p-1 rounded-lg flex mb-8 w-full max-w-sm">
                            <button 
                                onClick={() => setActivePreview('property')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${activePreview === 'property' ? 'bg-[#00FFC2] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Property Preview
                            </button>
                            <button 
                                onClick={() => setActivePreview('blueprint')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${activePreview === 'blueprint' ? 'bg-[#00FFC2] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Blueprint 3D Preview
                            </button>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 w-full flex items-center justify-center">
                            {activePreview === 'property' ? (
                                <div className="transform scale-100 w-full h-full max-h-[500px]">
                                    <PropertyPreviewCard property={livePreviewData} />
                                </div>
                            ) : (
                                <div className="transform scale-100 w-full h-full max-h-[500px]">
                                    <BlueprintPreviewCard 
                                        imageUrl={formData.blueprint3DUrl} 
                                        isGenerating={isGenerating3D} 
                                        progress={generationProgress}
                                        onFullView={setFullViewUrl}
                                        onDownload={handleDownloadBlueprint}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-900 border-t border-white/10 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isGenerating3D}
                        className="px-6 py-2.5 rounded-lg bg-[#00FFC2] text-black font-bold hover:bg-teal-300 transition-colors flex items-center shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Property
                    </button>
                </div>
            </div>

            {/* Full View Modal */}
            {fullViewUrl && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setFullViewUrl(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2" onClick={() => setFullViewUrl(null)}>
                        <XIcon className="w-8 h-8" />
                    </button>
                    <img src={fullViewUrl} alt="Full View" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}/>
                    <div className="absolute bottom-6 flex space-x-4" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => handleDownloadBlueprint(fullViewUrl)}
                            className="flex items-center px-4 py-2 bg-[#00FFC2] text-black font-bold rounded-full hover:bg-teal-300 transition-colors shadow-lg"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" /> Download
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Knowledge: React.FC<KnowledgeProps> = ({ user }) => {
    const [properties, setProperties] = React.useState<Property[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingProperty, setEditingProperty] = React.useState<Property | null>(null);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isBackgroundSaving, setIsBackgroundSaving] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        const unsubscribe = db.collection('users').doc(user.uid).collection('Property_details')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const props = snapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                } as Property));
                setProperties(props);
                setLoading(false);
            }, err => {
                console.error("Fetch error", err);
                setLoading(false);
            });
        return () => unsubscribe();
    }, [user.uid]);

    const handleAdd = () => {
        setEditingProperty(null);
        setEditorOpen(true);
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
        setEditorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this property?")) return;
        try {
            await db.collection('users').doc(user.uid).collection('Property_details').doc(id).delete();
            // Trigger webhook for sync
            await sendPropertyWebhook({ id } as Property, 'delete');
        } catch (e) {
            console.error(e);
            alert("Failed to delete");
        }
    };
    
    // Background Saving Logic
    const handleBackgroundSave = async (formData: Partial<Property>, imageFile: File | null, blueprintBlob: Blob | null) => {
        // 1. Close Editor Immediately
        setEditorOpen(false);
        setIsBackgroundSaving(true);
        setMessage(null);

        try {
            console.log("Saving property in background...");

            // 2. Upload Main Property Image (if changed)
            let finalImageUrl = formData.imageUrl || '';
            if (imageFile) {
                 // Delete old if needed (optional logic skipped for simplicity, but good practice)
                const storageRef = storage.ref(`posts/${user.uid}/${Date.now()}_${imageFile.name}`);
                await storageRef.put(imageFile);
                finalImageUrl = await storageRef.getDownloadURL();
            } else if (!formData.imageUrl) {
                finalImageUrl = ''; // User removed image
            }

            // 3. Upload 3D Blueprint Image (if newly generated)
            let finalBlueprintUrl = formData.blueprint3DUrl || '';
            if (blueprintBlob) {
                console.log("Uploading 3D blueprint...");
                const filename = `${Date.now()}_blueprint_3d.png`;
                const storageRef = storage.ref(`posts/${user.uid}/${filename}`);
                await storageRef.put(blueprintBlob);
                finalBlueprintUrl = await storageRef.getDownloadURL();
            }

            // 4. Save to Firestore
            const dataToSave = {
                userId: user.uid,
                title: formData.title || '',
                location: formData.location || '',
                price: Number(formData.price) || 0,
                currency: formData.currency || 'AED',
                bedrooms: Number(formData.bedrooms) || 0,
                bathrooms: Number(formData.bathrooms) || 0,
                area: Number(formData.area) || 0,
                propertyType: formData.propertyType || 'Apartment',
                status: formData.status || 'For Sale',
                plan: formData.plan || '1 BHK',
                propertyLink: formData.propertyLink || '',
                imageUrl: finalImageUrl,
                blueprint3DUrl: finalBlueprintUrl,
                createdAt: editingProperty?.createdAt || (firebase as any).firestore.FieldValue.serverTimestamp(),
            };
            
             if (editingProperty) {
                await db.collection('users').doc(user.uid).collection('Property_details').doc(editingProperty.id).update(dataToSave);
                await sendPropertyWebhook({ id: editingProperty.id, ...dataToSave } as Property, 'update');
                setMessage({ type: 'success', text: 'Property updated successfully!' });
            } else {
                const docRef = await db.collection('users').doc(user.uid).collection('Property_details').add(dataToSave);
                await sendPropertyWebhook({ id: docRef.id, ...dataToSave } as Property, 'create');
                setMessage({ type: 'success', text: 'Property added successfully!' });
            }

        } catch (error: any) {
            console.error("Background Save Error:", error);
            setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
        } finally {
            setIsBackgroundSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };


    return (
        <div className="container mx-auto p-4 md:p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
                    <p className="text-gray-400 mt-1">Manage your property portfolio and 3D blueprints.</p>
                </div>
                <button onClick={handleAdd} className="bg-[#00FFC2] text-black px-4 py-2 rounded-lg font-bold flex items-center hover:bg-teal-300 transition-colors shadow-lg shadow-teal-500/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Property
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg text-sm flex items-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-800' : 'bg-red-900/50 text-red-300 border border-red-800'}`}>
                    {message.type === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <SpinnerIcon className="w-12 h-12 text-[#00FFC2] animate-spin" />
                </div>
            ) : properties.length === 0 && !isBackgroundSaving ? (
                <div className="flex-1 flex flex-col justify-center items-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-12 bg-gray-900/30">
                    <BuildingOfficeIcon className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium text-gray-400">No properties found</p>
                    <p className="text-sm mb-6">Add your first property to get started with automation.</p>
                    <button onClick={handleAdd} className="text-[#00FFC2] hover:underline">Add Property</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {/* Show Loading Card if saving */}
                    {isBackgroundSaving && <SavingPropertyCard />}
                    
                    {properties.map(property => (
                        <div key={property.id} className="relative group">
                            <PropertyPreviewCard property={property} />
                            
                            {/* Actions Overlay */}
                            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleEdit(property)} 
                                    className="p-2 bg-gray-900 text-white rounded-full shadow-lg border border-gray-700 hover:bg-[#00FFC2] hover:text-black hover:border-[#00FFC2] transition-colors"
                                    title="Edit"
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(property.id)} 
                                    className="p-2 bg-gray-900 text-white rounded-full shadow-lg border border-gray-700 hover:bg-red-500 hover:border-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editorOpen && (
                <PropertyEditor 
                    user={user} 
                    property={editingProperty} 
                    onClose={() => setEditorOpen(false)} 
                    onSave={handleBackgroundSave}
                />
            )}
        </div>
    );
};

export default Knowledge;
