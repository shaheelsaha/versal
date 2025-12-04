<change>
    <file>components/Knowledge.tsx</file>
    <description>Update handleSaveClick to correctly upload generated 3D blueprint images to Firebase Storage and save only the URL to Firestore, fixing the document size error.</description>
    <content><![CDATA[
import * as React from 'react';
import { db, storage } from '../firebaseConfig';
import firebase from '../firebaseConfig';
import { Property, PropertyType, PropertyStatus, PropertyPlan } from '../types';
import {
  PlusIcon,
  FilterIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  SpinnerIcon,
  BuildingOfficeIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  LocationIcon,
  BedIcon,
  BathIcon,
  CurrencyDollarIcon,
  AreaIcon,
  LinkIcon,
  UploadIcon,
  SparklesIcon
} from './icons';

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex'];
const PROPERTY_STATUSES: PropertyStatus[] = ['For Sale', 'For Rent', 'Sold', 'Rented'];
const PROPERTY_PLANS: PropertyPlan[] = ['Studio', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];

// Helper function to send webhook
const sendPropertyWebhook = async (propertyData: Property, action: 'create' | 'update' | 'delete') => {
  const { id, createdAt, ...restOfData } = propertyData;

  let createdAtISO: string | null = null;
  if (createdAt && typeof (createdAt as any).toDate === 'function') {
    createdAtISO = (createdAt as any).toDate().toISOString();
  } else if (createdAt) {
    createdAtISO = new Date(createdAt as any).toISOString();
  }

  const payload = {
    ...restOfData,
    createdAt: createdAtISO,
    documentId: id,
    action,
  };

  try {
    const response = await fetch('https://n8n.sahaai.online/webhook/property_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook failed with status:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to send property webhook:', error);
  }
};


interface KnowledgeProps {
  user: any;
}

const Knowledge: React.FC<KnowledgeProps> = ({ user }) => {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<Property | null>(null);
  const [filters, setFilters] = React.useState({ search: '', status: '', type: '', plan: '' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const propertiesPerPage = 10;
  const [toasts, setToasts] = React.useState<{ id: number; message: string; type: 'success' }[]>([]);

  const addToast = (message: string, type: 'success' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000); // Toast disappears after 3 seconds
  };

  React.useEffect(() => {
    const propertiesRef = db.collection('users').doc(user.uid).collection('Property_details');
    const q = propertiesRef.orderBy('createdAt', 'desc');

    const unsubscribe = q.onSnapshot(
      querySnapshot => {
        const propsData: Property[] = [];
        querySnapshot.forEach(doc => {
          propsData.push({ id: doc.id, ...doc.data() } as Property);
        });
        setProperties(propsData);
        setLoading(false);
      },
      error => {
        console.error('Error fetching properties:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', type: '', plan: '' });
    setCurrentPage(1);
  };

  const filteredProperties = React.useMemo(() => {
    return properties.filter(p => {
      const searchLower = filters.search.toLowerCase();
      const title = (p.title || '').toString().toLowerCase();
      const location = (p.location || '').toString().toLowerCase();
      return (
        (title.includes(searchLower) || location.includes(searchLower)) &&
        (filters.status ? p.status === filters.status : true) &&
        (filters.type ? p.propertyType === filters.type : true) &&
        (filters.plan ? p.plan === filters.plan : true)
      );
    });
  }, [properties, filters]);

  const paginatedProperties = React.useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const propertyRef = db.collection('users').doc(user.uid).collection('Property_details').doc(propertyId);
        
        // Fetch the property data before deleting to send with the webhook
        const docSnap = await propertyRef.get();
        if (docSnap.exists) {
            const propertyToDelete = { id: docSnap.id, ...docSnap.data() } as Property;
            // Send webhook with full data and 'delete' action
            await sendPropertyWebhook(propertyToDelete, 'delete');
        } else {
            console.warn(`Property with id ${propertyId} not found, cannot send delete webhook.`);
        }
        
        // Then delete from Firestore
        await propertyRef.delete();
        addToast('Property deleted successfully.');
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete property.');
      }
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      const propertyRef = db.collection('users').doc(user.uid).collection('Property_details').doc(propertyId);
      await propertyRef.update({ status: newStatus });
      
      // Send webhook with updated data
      const updatedDoc = await propertyRef.get();
      if (updatedDoc.exists) {
        const updatedPropertyData = { id: updatedDoc.id, ...updatedDoc.data() } as Property;
        await sendPropertyWebhook(updatedPropertyData, 'update');
      }

      addToast('Status updated.');
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col text-white">
      <header className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-white">Knowledge</h1>
        <p className="mt-1 text-gray-400">Your smart data center for managing property information in real-time.</p>
      </header>

      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 mb-6 flex-shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title or location..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] outline-none transition text-white"
            />
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2]">
              <option value="">All Statuses</option>
              {PROPERTY_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2]">
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select name="plan" value={filters.plan} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2]">
              <option value="">All Plans</option>
              {PROPERTY_PLANS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg border border-gray-700">
              Reset
            </button>
          </div>
          <button onClick={handleAddProperty} className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-[#00FFC2] text-black rounded-lg font-semibold text-sm hover:bg-teal-300 transition-colors shadow-sm shadow-teal-500/30">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900/50 border border-white/10 rounded-xl shadow-sm">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3">
                Property
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Type & Plan
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Added On
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8">
                  <SpinnerIcon className="w-8 h-8 mx-auto animate-spin text-[#00FFC2]" />
                </td>
              </tr>
            ) : paginatedProperties.length > 0 ? (
              paginatedProperties.map(prop => (
                <tr key={prop.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="font-bold">{prop.title}</div>
                    <div className="text-xs text-gray-400">{prop.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat(prop.currency === 'USD' ? 'en-US' : 'en-AE', { style: 'currency', currency: prop.currency || 'USD', minimumFractionDigits: 0 }).format(
                      Number(prop.price) || 0
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {prop.propertyType} / {prop.plan}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={prop.status}
                      onChange={e => handleStatusChange(prop.id, e.target.value as PropertyStatus)}
                      className="text-xs font-semibold p-1 border border-gray-600 rounded-md focus:ring-[#00FFC2] focus:border-[#00FFC2] bg-gray-800 text-white appearance-none"
                    >
                      {PROPERTY_STATUSES.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {prop.createdAt && (prop.createdAt as any).toDate
                      ? (prop.createdAt as any).toDate().toLocaleDateString()
                      : prop.createdAt
                      ? new Date(prop.createdAt as any).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEditProperty(prop)} className="p-1.5 text-gray-400 hover:text-teal-400 hover:bg-gray-700 rounded-md">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProperty(prop.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  No properties found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-600 rounded-md disabled:opacity-50 flex items-center hover:bg-gray-700">
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-600 rounded-md disabled:opacity-50 flex items-center hover:bg-gray-700">
            Next <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      <PropertyEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} property={editingProperty} onSaveSuccess={addToast} />

      {/* Toast Container */}
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => (
            <div key={toast.id} className="max-w-sm w-full bg-gray-800 text-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium">{toast.message}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper for details list in preview card
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
        title = 'Sale in Jumeirah Living Business Bay: Panoramic Views',
        location = 'Jumeirah Living, Business Bay',
        bedrooms = 0,
        bathrooms = 0,
        area = 0,
        imageUrl,
        propertyLink,
      } = property;

    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-sm mx-auto font-sans h-full flex flex-col">
        <img
            src={imageUrl || 'https://storage.googleapis.com/aistudio-hosting.appspot.com/gallery/5f02f0a1-a637-4560-a292-32b0a94e844a.jpeg'}
            alt={title}
            className="w-full h-48 object-cover rounded-t-xl bg-gray-700 flex-shrink-0"
            onError={(e) => { e.currentTarget.src = 'https://storage.googleapis.com/aistudio-hosting.appspot.com/gallery/5f02f0a1-a637-4560-a292-32b0a94e844a.jpeg'; }}
        />
        <div className="p-4 flex-1 flex flex-col">
            <div>
                <h3 className="text-base font-semibold text-gray-100 leading-tight">
                    {title || 'Property Title'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">propertyfinder.ae</p>
            </div>
            <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600/80 rounded-lg flex-1">
                <ul className="space-y-3 text-sm">
                    <DetailItem icon={<LocationIcon />} label={location || "Property Location"} />
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
                        <a href={propertyLink || '#'} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline text-xs truncate">
                            {propertyLink || 'No link provided'}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    );
};

const BlueprintPreviewCard: React.FC<{ imageUrl?: string, isGenerating: boolean, progress?: number, onExpand?: () => void, onDownload?: () => void }> = ({ imageUrl, isGenerating, progress = 0, onExpand, onDownload }) => {
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
                            className="bg-gradient-to-r from-teal-400 to-[#00FFC2] h-2 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${Math.round(progress)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full text-xs text-gray-400 font-mono">
                        <span>Processing</span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 max-w-[240px] leading-relaxed">
                        Analyzing blueprint geometry and rendering high-fidelity isometric view. This usually takes about 30 seconds.
                    </p>
                </div>
            ) : imageUrl ? (
                <div className="w-full h-full flex flex-col">
                    <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-600 group bg-black">
                        <img 
                            src={imageUrl} 
                            alt="Generated 3D Model" 
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 gap-3">
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onExpand?.(); }}
                                className="bg-gray-700/80 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center backdrop-blur-sm transition-colors"
                            >
                                <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Full Screen
                            </button>
                             <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
                                className="bg-[#00FFC2] hover:bg-teal-300 text-black px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-lg shadow-teal-500/20 transition-colors"
                            >
                                <UploadIcon className="w-3.5 h-3.5 mr-1.5 rotate-180" /> Download
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 text-left">
                        <h4 className="text-white font-semibold flex items-center">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
                            3D Render Complete
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                            This high-quality isometric view is ready to be shared with potential buyers.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-gray-500">
                    <BuildingOfficeIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm">Upload a blueprint to generate a 3D view.</p>
                </div>
            )}
        </div>
    );
}

const FullScreenImageOverlay: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="relative max-w-full max-h-full">
            <img src={imageUrl} alt="Full Screen" className="max-w-full max-h-[90vh] object-contain shadow-2xl" />
            <button 
                onClick={onClose}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
            >
                <XIcon className="w-8 h-8" />
            </button>
        </div>
    </div>
);

interface PropertyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  property: Property | null;
  onSaveSuccess: (message: string) => void;
}

const PropertyEditorModal: React.FC<PropertyEditorModalProps> = ({ isOpen, onClose, user, property, onSaveSuccess }) => {
  const [formData, setFormData] = React.useState<Partial<Property>>({});
  const [saving, setSaving] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  
  // New state for Blueprint to 3D
  const [isGenerating3D, setIsGenerating3D] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [activePreview, setActivePreview] = React.useState<'property' | 'blueprint'>('property');
  const [fullScreenImage, setFullScreenImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (property) {
      setFormData({ ...property });
      setImagePreviewUrl(property.imageUrl || null);
      if (property.blueprint3DUrl) {
          // If editing a property that already has a 3D model, maybe show it?
          // Keeping default as property for now.
      }
    } else {
      setFormData({
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
        imageUrl: '',
        propertyLink: '',
        blueprint3DUrl: '',
      });
      setImagePreviewUrl(null);
    }
    setImageFile(null); // Reset file on open
    setIsGenerating3D(false);
    setGenerationProgress(0);
    setActivePreview('property');
    setFullScreenImage(null);
  }, [property, isOpen]);

  React.useEffect(() => {
    // Cleanup blob URL
    return () => {
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
    };
  }, [imagePreviewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(newPreviewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleBlueprintUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // 1. Validate file size (limit to 10MB due to webhook/payload limits)
        const MAX_SIZE_MB = 10;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File is too large. Please upload an image smaller than ${MAX_SIZE_MB}MB.`);
            e.target.value = ''; // Clear input
            return;
        }

        setIsGenerating3D(true);
        setActivePreview('blueprint'); // Auto-switch to blueprint view
        setGenerationProgress(0);

        // Simulate progress: 0 -> 90% over approx 30 seconds
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 90) return 90; // Stall at 90% until request finishes
                // Add random increment between 0.5 and 2.5
                return prev + Math.random() * 2 + 0.5;
            });
        }, 500);

        try {
            // 2. Robust Base64 extraction
            const base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const result = reader.result;
                  if (!result || typeof result !== "string") {
                    return reject(new Error("Invalid image result from FileReader"));
                  }
                  // result is "data:image/png;base64,....."
                  const parts = result.split(",");
                  // If for some reason the prefix is missing, handle gracefully (though readAsDataURL usually guarantees it)
                  const base64 = parts.length > 1 ? parts[1] : parts[0]; 
                  
                  if (!base64 || base64.trim().length === 0) {
                      return reject(new Error("Extracted Base64 string is empty"));
                  }
                  resolve(base64);
                } catch (err) {
                  reject(err);
                }
              };
              reader.onerror = () => reject(new Error("FileReader error"));
              reader.readAsDataURL(file);
            });

            const payload = {
                image: base64Data,
                details: {
                    title: formData.title,
                    type: formData.propertyType,
                    plan: formData.plan,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    area: formData.area,
                    location: formData.location
                }
            };

            console.log("Sending payload to n8n webhook:", { 
                imageLength: base64Data.length,
                details: payload.details
            });

            // Call the n8n webhook directly
            const response = await fetch('https://n8n.sahaai.online/webhook/2d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
            }

            // NEW: Handle binary blob response
            const blob = await response.blob();
            
            // Convert binary blob to Base64 Data URL for preview and saving
            const displayUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error("Failed to convert response blob to base64 string"));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Complete the progress bar
            clearInterval(progressInterval);
            setGenerationProgress(100);
            
            // Allow user to see 100% for a moment
            await new Promise(r => setTimeout(r, 600));

            if (displayUrl) {
              setFormData(prev => ({ ...prev, blueprint3DUrl: displayUrl }));
            } else {
                throw new Error("No valid image data returned from webhook.");
            }

        } catch (error: any) {
            console.error("Error generating 3D preview:", error);
            // Display exact error from backend if available (e.g., validation message)
            alert(`Error generating 3D model: ${error.message || 'Unknown error'}`);
            setGenerationProgress(0);
        } finally {
            clearInterval(progressInterval);
            setIsGenerating3D(false);
            // Clear input so same file can be selected again if needed
            e.target.value = '';
        }
    }
  };

  const removeBlueprint3D = () => {
      setFormData(prev => ({ ...prev, blueprint3DUrl: '' }));
  };

  const handleSaveClick = async () => {
    if (!formRef.current?.reportValidity()) return;

    setSaving(true);
    try {
        // 1. Handle Main Property Image
        let finalImageUrl = property?.imageUrl || '';
        
        if (imageFile) {
            // Delete old image if exists
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
        
        // Check if it's a Base64 Data URL (indicates new generation)
        if (finalBlueprintUrl.startsWith('data:')) {
             // Delete old blueprint if exists
            if (property?.blueprint3DUrl && property.blueprint3DUrl.startsWith('http')) {
                 try { await storage.refFromURL(property.blueprint3DUrl).delete(); } catch (e) { console.warn("Old blueprint deletion failed", e); }
            }

            // Convert Base64 Data URL to Blob for upload
            const response = await fetch(finalBlueprintUrl);
            const blob = await response.blob();
            
            // Upload to Storage
            const filename = `${Date.now()}_blueprint_3d.png`;
            // Using same folder structure 'posts' as per existing code convention for properties
            const storageRef = storage.ref(`posts/${user.uid}/${filename}`);
            await storageRef.put(blob);
            finalBlueprintUrl = await storageRef.getDownloadURL();
        } else if (!finalBlueprintUrl && property?.blueprint3DUrl) {
             // Blueprint removed by user
             try { await storage.refFromURL(property.blueprint3DUrl).delete(); } catch (e) { console.warn("Old blueprint deletion failed", e); }
        }

        // 3. Prepare Data for Firestore
        const { id, ...dataForFirestore } = formData;

        // Explicitly construct the object to avoid carrying over large strings from ...dataForFirestore
        const dataToSave = {
            ...dataForFirestore, // This might still contain the old blueprint3DUrl if we don't overwrite it carefully
            userId: user.uid,
            createdAt: property?.createdAt || (firebase as any).firestore.FieldValue.serverTimestamp(),
            imageUrl: finalImageUrl,
            blueprint3DUrl: finalBlueprintUrl, // This MUST be the URL or empty string
            // Ensure numeric fields
            price: Number(formData.price) || 0,
            area: Number(formData.area) || 0,
            bedrooms: Number(formData.bedrooms) || 0,
            bathrooms: Number(formData.bathrooms) || 0,
        };

        // Safety check: Ensure no base64 slipped through
        if (dataToSave.blueprint3DUrl && dataToSave.blueprint3DUrl.length > 2000) {
             throw new Error("Failed to upload Blueprint image. Data is too large to save.");
        }

        if (property) {
            const propertyRef = db.collection('users').doc(user.uid).collection('Property_details').doc(property.id);
            await propertyRef.update(dataToSave);
            
            const updatedPropertyData = { ...property, ...dataToSave, createdAt: property.createdAt } as Property;
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

  if (!isOpen) return null;

  const livePreviewData = { ...formData, imageUrl: imagePreviewUrl || formData.imageUrl };
  const inputClasses = "w-full mt-1 p-2 border rounded-md bg-gray-800 border-gray-600 text-white focus:ring-[#00FFC2] focus:border-[#00FFC2]";
  const selectClasses = `${inputClasses} appearance-none`;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col text-white">
        <header className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{property ? 'Edit Property' : 'Add New Property'}</h2>
          <button onClick={onClose}>
            <XIcon className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            <form ref={formRef} className="flex-1 flex flex-col overflow-hidden border-r border-gray-700" noValidate>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-300">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className={inputClasses}/>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required className={inputClasses}/>
                </div>
                <div>
                    <label className="text-sm font-medium">Property Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreviewUrl ? (
                                <div className="relative group">
                                    <img src={imagePreviewUrl} alt="Preview" className="mx-auto h-32 w-auto rounded-md shadow-sm"/>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={removeImage} className="text-white bg-red-600 rounded-full p-2 hover:bg-red-700">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500"/>
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-teal-400 hover:text-teal-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 focus-within:ring-offset-gray-900">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" ref={fileInputRef} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Blueprint to 3D Section */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <label className="flex items-center text-sm font-medium text-white mb-2">
                        <SparklesIcon className="w-4 h-4 mr-2 text-[#00FFC2]" />
                        Blueprint to 3D
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-gray-900/50">
                        <div className="space-y-1 text-center w-full">
                            {isGenerating3D ? (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <SpinnerIcon className="w-8 h-8 animate-spin text-[#00FFC2] mb-2" />
                                    <p className="text-sm text-gray-300">Generating 3D model with AI... ({Math.round(generationProgress)}%)</p>
                                </div>
                            ) : formData.blueprint3DUrl ? (
                                <div className="relative group w-full">
                                    <img src={formData.blueprint3DUrl} alt="Generated 3D Model" className="mx-auto max-h-48 w-auto rounded-md shadow-sm border border-gray-700"/>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={removeBlueprint3D} className="text-white bg-red-600 rounded-full p-2 hover:bg-red-700">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-400 mt-2">3D Model Generated Successfully</p>
                                </div>
                            ) : (
                                <>
                                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-500"/>
                                    <div className="flex text-sm text-gray-400 justify-center">
                                        <label htmlFor="blueprint-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-teal-400 hover:text-teal-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 focus-within:ring-offset-gray-900">
                                            <span>Upload Blueprint</span>
                                            <input id="blueprint-upload" name="blueprint-upload" type="file" className="sr-only" onChange={handleBlueprintUpload} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Upload a 2D floor plan to generate a 3D view.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                 <div>
                  <label className="text-sm font-medium">Property Link</label>
                  <input type="url" name="propertyLink" value={formData.propertyLink || ''} onChange={handleChange} placeholder="https://www.propertyfinder.ae/..." className={inputClasses}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <div className="flex items-center mt-1">
                        <input type="number" name="price" value={formData.price ?? 0} onChange={handleChange} required min="0" className={`${inputClasses} rounded-r-none`} />
                        <select name="currency" value={formData.currency || 'AED'} onChange={handleChange} className={`${selectClasses} p-2 border-t border-b border-r rounded-r-md bg-gray-700 border-gray-600`}>
                            <option>AED</option>
                            <option>USD</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Area (sqft)</label>
                    <input type="number" name="area" value={formData.area ?? 0} onChange={handleChange} required min="0" step="1" className={inputClasses}/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={selectClasses}>
                      {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Property Type</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={selectClasses}>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <select name="plan" value={formData.plan} onChange={handleChange} className={selectClasses}>
                      {PROPERTY_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bedrooms</label>
                    <input type="number" name="bedrooms" value={formData.bedrooms ?? 1} onChange={handleChange} required min="0" step="1" className={inputClasses}/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bathrooms</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms ?? 1} onChange={handleChange} required min="0" step="1" className={inputClasses}/>
                  </div>
                </div>
              </div>
            </form>
            
            {/* Right Side Preview Panel */}
            <div className="bg-[#0D1117] p-6 hidden md:flex flex-col items-center justify-start overflow-hidden relative">
                {/* Preview Switcher Tabs */}
                <div className="bg-gray-800 p-1 rounded-lg flex mb-6 w-full max-w-sm">
                    <button 
                        onClick={() => setActivePreview('property')}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${activePreview === 'property' ? 'bg-[#00FFC2] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Property Preview
                    </button>
                    <button 
                        onClick={() => setActivePreview('blueprint')}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${activePreview === 'blueprint' ? 'bg-[#00FFC2] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Blueprint 3D Preview
                    </button>
                </div>

                <div className="flex-1 w-full flex items-center justify-center">
                    {activePreview === 'property' ? (
                        <div className="transform scale-95 w-full h-full">
                            <PropertyPreviewCard property={livePreviewData} />
                        </div>
                    ) : (
                        <div className="transform scale-95 w-full h-full">
                            <BlueprintPreviewCard 
                                imageUrl={formData.blueprint3DUrl} 
                                isGenerating={isGenerating3D} 
                                progress={generationProgress}
                                onExpand={() => setFullScreenImage(formData.blueprint3DUrl || null)}
                                onDownload={() => {
                                    if(formData.blueprint3DUrl) {
                                        const link = document.createElement('a');
                                        link.href = formData.blueprint3DUrl;
                                        link.download = `3d-blueprint-${Date.now()}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
                {fullScreenImage && <FullScreenImageOverlay imageUrl={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
            </div>
        </div>

        <footer className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSaveClick}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#00FFC2] text-black hover:bg-teal-300 disabled:bg-teal-800 flex items-center"
            >
                {saving && <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? 'Saving...' : 'Save Property'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default Knowledge;
]]></content>
</change>