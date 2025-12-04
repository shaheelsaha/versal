
import * as React from 'react';
import { db, storage } from '../firebaseConfig';
import firebase from '../firebaseConfig';
import { Property, PropertyType, PropertyStatus, PropertyPlan } from '../types';
import { 
    PlusIcon, EditIcon, TrashIcon, XIcon, SpinnerIcon, 
    UploadIcon, BuildingOfficeIcon, LocationIcon, 
    CurrencyDollarIcon, BedIcon, BathIcon, AreaIcon, 
    LinkIcon, SparklesIcon 
} from './icons';
import { GoogleGenAI } from "@google/genai";

interface KnowledgeProps {
    user: any;
}

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

const PropertyCard: React.FC<{ property: Property, onEdit: (p: Property) => void, onDelete: (p: Property) => void }> = ({ property, onEdit, onDelete }) => (
    <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative h-48 bg-gray-800">
            {property.imageUrl ? (
                <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <BuildingOfficeIcon className="w-12 h-12" />
                </div>
            )}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(property); }} className="p-2 bg-gray-900/80 text-white rounded-full hover:bg-[#00FFC2] hover:text-black transition-colors">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(property); }} className="p-2 bg-gray-900/80 text-white rounded-full hover:bg-red-500 hover:text-white transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium">
                {property.status}
            </div>
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold text-white truncate">{property.title}</h3>
            <p className="text-sm text-gray-400 flex items-center mt-1">
                <LocationIcon className="w-4 h-4 mr-1" /> {property.location}
            </p>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                <div className="flex items-center" title="Price">
                    <span className="font-bold text-[#00FFC2]">{property.currency} {property.price.toLocaleString()}</span>
                </div>
                <div className="flex space-x-3 text-xs text-gray-500">
                     <span className="flex items-center" title="Bedrooms"><BedIcon className="w-3.5 h-3.5 mr-1"/> {property.bedrooms}</span>
                     <span className="flex items-center" title="Bathrooms"><BathIcon className="w-3.5 h-3.5 mr-1"/> {property.bathrooms}</span>
                     <span className="flex items-center" title="Area"><AreaIcon className="w-3.5 h-3.5 mr-1"/> {property.area} sqft</span>
                </div>
            </div>
        </div>
    </div>
);

interface PropertyEditorProps {
    user: any;
    property?: Property | null;
    onClose: () => void;
    onSaveSuccess: (msg: string) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ user, property, onClose, onSaveSuccess }) => {
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
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [isGeneratingBlueprint, setIsGeneratingBlueprint] = React.useState(false);

    React.useEffect(() => {
        if (property) {
            setFormData(property);
            setImagePreviewUrl(property.imageUrl || null);
        }
    }, [property]);

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

    const handleGenerateBlueprint = async () => {
        if (!process.env.API_KEY) {
            console.error("API Key missing");
            alert("API Key is missing from environment variables.");
            return;
        }

        setIsGeneratingBlueprint(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a modern 3D floor plan blueprint for a ${formData.propertyType}. 
            Details: ${formData.bedrooms} Bedrooms, ${formData.bathrooms} Bathrooms, ${formData.area} sqft. 
            View: Isometric top-down. Style: Realistic, architectural visualization, clear room layout.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "1:1",
                        imageSize: "1K" // Generating at 1K, though prompt guidelines mention flash-image is general purpose. 
                    }
                }
            });

            let foundImage = false;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64Data = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        const dataUrl = `data:${mimeType};base64,${base64Data}`;
                        setFormData(prev => ({ ...prev, blueprint3DUrl: dataUrl }));
                        foundImage = true;
                        break;
                    }
                }
            }

            if (!foundImage) {
                // If not inline data, maybe the prompt was refused or text returned
                 const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
                 console.warn("No image generated. Text response:", text);
                 alert("AI did not generate an image. It might have generated text instead.");
            }

        } catch (error) {
            console.error("Failed to generate blueprint:", error);
            alert("Failed to generate 3D blueprint. Please try again.");
        } finally {
            setIsGeneratingBlueprint(false);
        }
    };

    const handleSaveClick = async () => {
        if (!formRef.current?.reportValidity()) return;

        setSaving(true);
        try {
            console.log("Starting property save...");

            // 1. Handle Main Property Image
            let finalImageUrl = property?.imageUrl || '';
            
            if (imageFile) {
                // Delete old image if exists and is a remote URL
                if (property?.imageUrl && property.imageUrl.startsWith('http')) {
                    try { await storage.refFromURL(property.imageUrl).delete(); } catch (e) { console.warn("Old image deletion failed", e); }
                }
                
                // Upload new image
                const storageRef = storage.ref(`posts/${user.uid}/${Date.now()}_${imageFile.name}`);
                await storageRef.put(imageFile);
                finalImageUrl = await storageRef.getDownloadURL();
            } else if (!imagePreviewUrl && property?.imageUrl) {
                // Image removed by user
                 try { await storage.refFromURL(property.imageUrl).delete(); } catch (e) { console.warn("Old image deletion failed", e); }
                finalImageUrl = '';
            }

            // 2. Handle 3D Blueprint Image
            let finalBlueprintUrl = formData.blueprint3DUrl || '';
            
            // Check if it's a Base64 Data URL (indicates new generation that needs uploading)
            if (finalBlueprintUrl.startsWith('data:')) {
                 console.log("Uploading generated 3D blueprint...");
                 
                 // Delete old blueprint if exists
                if (property?.blueprint3DUrl && property.blueprint3DUrl.startsWith('http')) {
                     try { await storage.refFromURL(property.blueprint3DUrl).delete(); } catch (e) { console.warn("Old blueprint deletion failed", e); }
                }

                // Convert Base64 Data URL to Blob for upload
                const response = await fetch(finalBlueprintUrl);
                const blob = await response.blob();
                
                // Upload to Storage
                const filename = `${Date.now()}_blueprint_3d.png`;
                const storageRef = storage.ref(`posts/${user.uid}/${filename}`);
                await storageRef.put(blob);
                finalBlueprintUrl = await storageRef.getDownloadURL();
                console.log("Blueprint uploaded successfully:", finalBlueprintUrl);

            } else if (!finalBlueprintUrl && property?.blueprint3DUrl) {
                 // Blueprint removed by user
                 try { await storage.refFromURL(property.blueprint3DUrl).delete(); } catch (e) { console.warn("Old blueprint deletion failed", e); }
            }

            // 3. Construct Data for Firestore STRICTLY
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
                createdAt: property?.createdAt || (firebase as any).firestore.FieldValue.serverTimestamp(),
            };

             // Safety check: Ensure blueprint3DUrl is not a massive string before sending to Firestore
             if (dataToSave.blueprint3DUrl && dataToSave.blueprint3DUrl.length > 5000) {
                  throw new Error(`Failed to upload Blueprint image properly. URL is too long (${dataToSave.blueprint3DUrl.length} chars). Save aborted to prevent database error.`);
             }

            if (property) {
                const propertyRef = db.collection('users').doc(user.uid).collection('Property_details').doc(property.id);
                await propertyRef.update(dataToSave);
                
                const updatedPropertyData = { id: property.id, ...dataToSave } as Property;
                await sendPropertyWebhook(updatedPropertyData, 'update');
                
                onSaveSuccess('Property updated successfully!');
            } else {
                const docRef = await db.collection('users').doc(user.uid).collection('Property_details').add(dataToSave);
                
                const newDoc = await docRef.get();
                const newPropertyData = { id: newDoc.id, ...newDoc.data() } as Property;
                await sendPropertyWebhook(newPropertyData, 'create');
                
                onSaveSuccess('Property added successfully!');
            }
            onClose();
        } catch (error: any) {
            console.error('Error saving property:', error);
            alert(`Failed to save property: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">{property ? 'Edit Property' : 'Add New Property'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <form ref={formRef} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Property Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" placeholder="e.g. Luxury Apartment in Downtown" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                                <div className="relative">
                                    <LocationIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" placeholder="City, Area" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                                    <select name="currency" value={formData.currency} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]">
                                        <option value="AED">AED</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Bedrooms</label>
                                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Bathrooms</label>
                                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Area (sqft)</label>
                                    <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Property Type</label>
                                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]">
                                    <option value="Apartment">Apartment</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Townhouse">Townhouse</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Duplex">Duplex</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]">
                                    <option value="For Sale">For Sale</option>
                                    <option value="For Rent">For Rent</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Rented">Rented</option>
                                </select>
                            </div>

                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Property Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                                    <input type="url" name="propertyLink" value={formData.propertyLink} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 p-2.5 text-white focus:ring-2 focus:ring-[#00FFC2]" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t border-gray-700 pt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Main Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-24 h-24 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                                        {imagePreviewUrl ? (
                                            <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <BuildingOfficeIcon className="w-8 h-8 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition inline-flex items-center">
                                            <UploadIcon className="w-4 h-4 mr-2" /> Upload Image
                                            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">Recommended size: 1200x800px</p>
                                    </div>
                                </div>
                            </div>

                             <div className="md:col-span-2 border-t border-gray-700 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-300">3D Blueprint</label>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateBlueprint} 
                                        disabled={isGeneratingBlueprint}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded flex items-center transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingBlueprint ? <SpinnerIcon className="w-3 h-3 mr-1 animate-spin"/> : <SparklesIcon className="w-3 h-3 mr-1"/>}
                                        Generate with AI
                                    </button>
                                </div>
                                <div className="border border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-800/30">
                                    {formData.blueprint3DUrl ? (
                                        <div className="relative w-full max-w-xs">
                                            <img src={formData.blueprint3DUrl} alt="Blueprint" className="w-full rounded-lg shadow-sm" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({...prev, blueprint3DUrl: ''}))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-4">
                                            <p className="text-sm">No blueprint uploaded.</p>
                                            <p className="text-xs mt-1">Use the AI button to generate one based on property specs.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-white/10 flex justify-end space-x-3 bg-gray-900 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                    <button onClick={handleSaveClick} disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#00FFC2] text-black font-bold hover:bg-teal-300 transition-colors flex items-center shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving && <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />}
                        {saving ? 'Saving...' : 'Save Property'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Knowledge: React.FC<KnowledgeProps> = ({ user }) => {
    const [properties, setProperties] = React.useState<Property[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    React.useEffect(() => {
        const unsubscribe = db.collection('users').doc(user.uid).collection('Property_details')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const props = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Property[];
                setProperties(props);
                setLoading(false);
            }, err => {
                console.error("Error fetching properties", err);
                setLoading(false);
            });
        return () => unsubscribe();
    }, [user.uid]);

    const handleAddClick = () => {
        setSelectedProperty(null);
        setEditorOpen(true);
    };

    const handleEditClick = (property: Property) => {
        setSelectedProperty(property);
        setEditorOpen(true);
    };

    const handleDeleteClick = async (property: Property) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        try {
            await db.collection('users').doc(user.uid).collection('Property_details').doc(property.id).delete();
            // Try to delete image if exists
            if (property.imageUrl && property.imageUrl.startsWith('http')) {
                storage.refFromURL(property.imageUrl).delete().catch(console.warn);
            }
             await sendPropertyWebhook(property, 'delete');
            setMessage({ type: 'success', text: 'Property deleted successfully.' });
        } catch (error) {
            console.error("Delete failed", error);
            setMessage({ type: 'error', text: 'Failed to delete property.' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveSuccess = (msg: string) => {
        setMessage({ type: 'success', text: msg });
        setEditorOpen(false);
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
                    <p className="text-gray-400 mt-1">Manage your property portfolio. The AI uses this data to answer queries.</p>
                </div>
                <button onClick={handleAddClick} className="bg-[#00FFC2] text-black font-bold py-2.5 px-4 rounded-lg hover:bg-teal-300 transition-colors flex items-center shadow-lg shadow-teal-500/20">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Property
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <SpinnerIcon className="w-12 h-12 animate-spin text-[#00FFC2]" />
                </div>
            ) : properties.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-12 bg-gray-900/30 border border-white/5 rounded-2xl border-dashed">
                    <BuildingOfficeIcon className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No properties yet</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-md">Add your properties here so the AI Agent can recommend them to potential leads.</p>
                    <button onClick={handleAddClick} className="bg-gray-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                        Add Your First Property
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map(prop => (
                        <PropertyCard 
                            key={prop.id} 
                            property={prop} 
                            onEdit={handleEditClick} 
                            onDelete={handleDeleteClick} 
                        />
                    ))}
                </div>
            )}

            {editorOpen && (
                <PropertyEditor 
                    user={user} 
                    property={selectedProperty} 
                    onClose={() => setEditorOpen(false)} 
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default Knowledge;
