


import * as React from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, UploadIcon, XIcon, TwitterIcon, LinkedInIcon, FileIcon, InstagramIcon, FacebookIcon, TikTokIcon, ThreadsIcon, YouTubeIcon, PlayIcon, EditIcon, TrashIcon, SparklesIcon, CheckCircleIcon, AlertTriangleIcon, PlusIcon, InfoIcon, PinterestIcon } from './icons';
import { Post, SocialPlatform } from '../types';
import { db, storage, auth } from '../firebaseConfig';
import firebase from '../firebaseConfig'; // Import from local config to avoid runtime failure
import { Calendar } from './Calendar';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


const platformDetails: { [key in SocialPlatform]: { icon: React.FC<{className?: string, style?: React.CSSProperties}>, color: string, brandColor: string } } = {
    [SocialPlatform.FACEBOOK]: { icon: FacebookIcon, color: 'bg-blue-800', brandColor: '#1877F2' },
    [SocialPlatform.INSTAGRAM]: { icon: InstagramIcon, color: 'bg-pink-600', brandColor: 'transparent' },
    [SocialPlatform.LINKEDIN]: { icon: LinkedInIcon, color: 'bg-blue-700', brandColor: '#0A66C2' },
    [SocialPlatform.THREADS]: { icon: ThreadsIcon, color: 'bg-black', brandColor: '#000000' },
    [SocialPlatform.TWITTER]: { icon: TwitterIcon, color: 'bg-sky-500', brandColor: '#000000' },
    [SocialPlatform.TIKTOK]: { icon: TikTokIcon, color: 'bg-black', brandColor: '#000000' },
    [SocialPlatform.YOUTUBE]: { icon: YouTubeIcon, color: 'bg-red-600', brandColor: '#FF0000' },
    [SocialPlatform.PINTEREST]: { icon: PinterestIcon, color: 'bg-red-700', brandColor: '#E60023' },
};

// Ensures a consistent order for platforms in the UI
const platformOrder: SocialPlatform[] = [
    SocialPlatform.TWITTER,
    SocialPlatform.LINKEDIN,
    SocialPlatform.INSTAGRAM,
    SocialPlatform.FACEBOOK,
    SocialPlatform.THREADS,
    SocialPlatform.YOUTUBE,
    SocialPlatform.TIKTOK,
    SocialPlatform.PINTEREST,
];


const TimePicker: React.FC<{
    selectedTime: Date;
    onChange: (date: Date) => void;
    disabled?: boolean;
}> = ({ selectedTime, onChange, disabled }) => {
    const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = String(minutes).padStart(2, '0');
        return {
            hour: String(hours),
            minute: minutesStr,
            period: ampm as 'AM' | 'PM'
        };
    };

    const [time, setTime] = React.useState(formatTime(selectedTime));

    React.useEffect(() => {
        setTime(formatTime(selectedTime));
    }, [selectedTime]);
    
    const commitChange = (newTime: { hour: string, minute: string, period: 'AM' | 'PM' }) => {
        let newHour = Number(newTime.hour);
        if (newTime.period === 'PM' && newHour < 12) {
            newHour += 12;
        }
        if (newTime.period === 'AM' && newHour === 12) {
            newHour = 0;
        }
        
        const newDate = new Date(selectedTime);
        newDate.setHours(newHour, Number(newTime.minute));
        onChange(newDate);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val === '' || (Number(val) >= 1 && Number(val) <= 12)) {
            setTime(t => ({...t, hour: val}));
        }
    };

    const handleHourBlur = () => {
        if (time.hour === '') {
            const newTime = {...time, hour: '12'};
            setTime(newTime);
            commitChange(newTime);
        } else {
            commitChange(time);
        }
    };
    
    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val === '' || (Number(val) >= 0 && Number(val) <= 59)) {
             setTime(t => ({...t, minute: val}));
        }
    };

    const handleMinuteBlur = () => {
        const newTime = {...time, minute: time.minute.padStart(2, '0')};
        setTime(newTime);
        commitChange(newTime);
    };

    const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
        const newTime = {...time, period: newPeriod};
        setTime(newTime);
        commitChange(newTime);
    };

    return (
         <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-[#00FFC2]/50 focus-within:border-[#00FFC2] px-1">
                <input
                    type="text"
                    value={time.hour}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    disabled={disabled}
                    className="w-10 text-center bg-transparent outline-none py-1.5 sm:text-sm text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-500 -mx-1">:</span>
                <input
                    type="text"
                    value={time.minute}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    disabled={disabled}
                    className="w-10 text-center bg-transparent outline-none py-1.5 sm:text-sm text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
            <div className="flex items-center bg-gray-700 rounded-lg p-0.5">
                <button type="button" onClick={() => handlePeriodChange('AM')} disabled={disabled} className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${time.period === 'AM' ? 'bg-[#00FFC2] text-black shadow-sm' : 'bg-transparent text-gray-400 hover:bg-gray-600'}`}>AM</button>
                <button type="button" onClick={() => handlePeriodChange('PM')} disabled={disabled} className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${time.period === 'PM' ? 'bg-[#00FFC2] text-black shadow-sm' : 'bg-transparent text-gray-400 hover:bg-gray-600'}`}>PM</button>
            </div>
        </div>
    );
};

type PostEditorProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (postData: Omit<Post, 'id' | 'userId'>, newMediaFiles: File[], existingMediaUrls: string[]) => void;
    initialData?: Post | null;
    initialDate?: Date;
    isUploading: boolean;
    connectedPlatforms: SocialPlatform[];
};

type ContentType = 'image' | 'reel' | 'video';

const PostEditorModal: React.FC<PostEditorProps> = ({ isOpen, onClose, onSubmit, initialData, initialDate, isUploading, connectedPlatforms }) => {
    const [mediaFile, setMediaFile] = React.useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = React.useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [caption, setCaption] = React.useState('');
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<SocialPlatform[]>([]);
    const [scheduledAt, setScheduledAt] = React.useState(initialDate || new Date());
    const [publishMode, setPublishMode] = React.useState<'schedule' | 'now'>('schedule');
    const [contentType, setContentType] = React.useState<ContentType>('image');
    const [autoCommenting, setAutoCommenting] = React.useState(false);
    const [isContentTypeLocked, setIsContentTypeLocked] = React.useState(false);
    const [errors, setErrors] = React.useState<{ platform?: string; caption?: string; schedule?: string }>({});
    
    // Calendar State
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const [calendarPos, setCalendarPos] = React.useState<{ top: number; left: number } | null>(null);
    const calendarRef = React.useRef<HTMLDivElement>(null);
    const popupRef = React.useRef<HTMLDivElement>(null);

    const isPublished = initialData?.status === 'published';

    // Cleanup previous object URLs when the modal closes or media changes.
    React.useEffect(() => {
        return () => {
            if (mediaPreview && mediaPreview.url.startsWith('blob:')) {
                URL.revokeObjectURL(mediaPreview.url);
            }
        };
    }, [mediaPreview]);

    // Handle click outside for calendar
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideInput = calendarRef.current && calendarRef.current.contains(target);
            const isInsidePopup = popupRef.current && popupRef.current.contains(target);

            if (!isInsideInput && !isInsidePopup) {
                setIsCalendarOpen(false);
            }
        };

        if (isCalendarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', () => setIsCalendarOpen(false));
            window.addEventListener('scroll', () => setIsCalendarOpen(false), true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', () => setIsCalendarOpen(false));
            window.removeEventListener('scroll', () => setIsCalendarOpen(false), true);
        };
    }, [isCalendarOpen]);


    const resetForm = React.useCallback((baseDate: Date) => {
        setMediaFile(null);
        setMediaPreview(null);
        setCaption('');
        setSelectedPlatforms([]);
        setScheduledAt(baseDate);
        setPublishMode('schedule');
        setContentType('image');
        setAutoCommenting(false);
        setIsContentTypeLocked(false);
        setErrors({});
        setIsCalendarOpen(false);
    }, []);
    
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode
                setCaption(initialData.caption);
                setSelectedPlatforms(initialData.platforms);
                const scheduledDate = new Date(initialData.scheduledAt);
                setScheduledAt(scheduledDate);
                setPublishMode(scheduledDate > new Date(Date.now() + 60000) ? 'schedule' : 'now');
                setAutoCommenting(initialData.autoCommenting || false);
                
                setMediaFile(null); // No new file initially
                if (initialData.mediaUrls.length > 0) {
                    const url = initialData.mediaUrls[0];
                    const type = url.match(/\.(mp4|mov|webm|mkv)$/i) ? 'video' : 'image';
                    setMediaPreview({ url, type });
                    
                    if (initialData.contentType) {
                        setContentType(initialData.contentType);
                    } else {
                        // Fallback for older posts without contentType
                        if (type === 'video') {
                            const hasReelPlatform = initialData.platforms.some(p => [SocialPlatform.INSTAGRAM, SocialPlatform.TIKTOK].includes(p));
                            setContentType(hasReelPlatform ? 'reel' : 'video');
                        } else {
                            setContentType('image');
                        }
                    }
                    setIsContentTypeLocked(true);
                } else {
                    setMediaPreview(null);
                    setIsContentTypeLocked(false);
                    setContentType('image');
                }
            } else {
                // Creating mode
                resetForm(initialDate || new Date());
                setSelectedPlatforms(connectedPlatforms); // Auto-select connected platforms
            }
        }
    }, [isOpen, initialData, initialDate, resetForm, connectedPlatforms]);
    
    const handleClose = () => {
        resetForm(new Date());
        onClose();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clean up previous blob URL if it exists
        if (mediaPreview && mediaPreview.url.startsWith('blob:')) {
            URL.revokeObjectURL(mediaPreview.url);
        }

        setMediaFile(file);
        setIsContentTypeLocked(false); // Unlock while detecting

        const objectUrl = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            setMediaPreview({ url: objectUrl, type: 'image' });
            setContentType('image');
            setIsContentTypeLocked(true);
        } else if (file.type.startsWith('video/')) {
            setMediaPreview({ url: objectUrl, type: 'video' });
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const isVertical = video.videoHeight > video.videoWidth;
                setContentType(isVertical ? 'reel' : 'video');
                setIsContentTypeLocked(true);
            };
            video.src = objectUrl;
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setIsContentTypeLocked(false);
        setContentType('image'); // Reset to default
    };

    const togglePlatform = (platform: SocialPlatform) => {
        setSelectedPlatforms(prev => 
            prev.includes(platform) 
                ? prev.filter(p => p !== platform) 
                : [...prev, platform]
        );
    };

    const handleSubmission = (status: 'scheduled' | 'draft') => {
        setErrors({});
        const newErrors: { platform?: string; caption?: string; schedule?: string } = {};

        if (status !== 'draft') {
            if (selectedPlatforms.length === 0) newErrors.platform = 'Please select at least one platform.';
            if (caption.trim() === '') newErrors.caption = 'A caption is required.';
            if (publishMode === 'schedule' && scheduledAt <= new Date()) newErrors.schedule = 'Scheduled time must be in the future.';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        const keptExistingUrls = mediaPreview && mediaPreview.url.startsWith('http') ? [mediaPreview.url] : [];
        const newMediaToUpload = mediaFile ? [mediaFile] : [];
        
        if (status !== 'draft' && keptExistingUrls.length === 0 && newMediaToUpload.length === 0) {
            alert('Please upload a media file.');
            return;
        }
        
        onSubmit({
            caption,
            platforms: selectedPlatforms,
            tags: [], 
            scheduledAt: publishMode === 'now' ? new Date().toISOString() : scheduledAt.toISOString(),
            status,
            mediaUrls: keptExistingUrls, // Pass only existing URLs. The parent component will handle upload and merge.
            autoCommenting,
            contentType,
        }, newMediaToUpload, keptExistingUrls);
    }

    const toggleCalendar = (e: React.MouseEvent) => {
        if (isPublished) return;
        if (isCalendarOpen) {
            setIsCalendarOpen(false);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            // Position at bottom left of trigger, but allow for some margin
            // Check if it goes off screen
            let top = rect.bottom + 8;
            let left = rect.left;
            
            const calendarHeight = 360; // approx
            const calendarWidth = 300; // approx
            
            if (top + calendarHeight > window.innerHeight) {
                // flip up
                top = rect.top - calendarHeight - 8;
            }
            
            if (left + calendarWidth > window.innerWidth) {
                 left = window.innerWidth - calendarWidth - 20;
            }

            setCalendarPos({ top, left });
            setIsCalendarOpen(true);
        }
    }

    return (
        <div className={`fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <header className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">{isPublished ? 'View Published Post' : 'Share to social media'}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmission('scheduled'); }} className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-6 md:order-2 bg-gray-900/50">
                            {mediaPreview ? (
                                <div>
                                    <div className={`relative w-full bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 ${contentType === 'reel' ? 'aspect-[9/16] max-w-[280px] mx-auto' : 'aspect-square'}`}>
                                        <div className={`w-full h-full overflow-hidden ${contentType === 'reel' ? 'rounded-xl shadow-inner' : ''}`}>
                                            {mediaPreview.type === 'video' 
                                                ? <video src={mediaPreview.url} controls className="w-full h-full object-contain bg-black"></video>
                                                : <img src={mediaPreview.url} alt="preview" className="w-full h-full object-contain"/>
                                            }
                                        </div>
                                         {!isPublished && <button 
                                            type="button" 
                                            onClick={removeMedia}
                                            className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                            aria-label={`Remove media`}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>}
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="modal-file-upload-main" className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-[#00FFC2] hover:bg-teal-900/20 transition-colors">
                                     <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                                     <h3 className="font-semibold text-gray-300">Upload your media</h3>
                                     <p className="text-sm text-gray-500 mt-1">Drag & drop a file or click to browse.</p>
                                     <span className="mt-4 px-5 py-2.5 text-sm font-semibold text-black bg-[#00FFC2] rounded-lg shadow-sm hover:bg-teal-300">
                                        Browse file
                                     </span>
                                     <input type="file" onChange={handleFileChange} className="hidden" id="modal-file-upload-main" disabled={isPublished} accept="image/*,video/*"/>
                                </label>
                            )}
                        </div>
                        <div className="p-6 space-y-6 md:order-1 md:border-r md:border-white/10">
                            {/* Platform Selector */}
                            <div>
                                <div className="grid grid-cols-4 gap-3">
                                     {platformOrder.map(platformKey => {
                                        const details = platformDetails[platformKey];
                                        if (!details) return null;
                                        const { icon: Icon, brandColor } = details;

                                        const isConnected = connectedPlatforms.includes(platformKey);
                                        const isSelected = selectedPlatforms.includes(platformKey);
                                        
                                        // FIX: Avoid mutating CSSProperties object directly to resolve TS error
                                        const iconStyle: React.CSSProperties = (isSelected && isConnected && platformKey !== SocialPlatform.INSTAGRAM)
                                            ? { color: brandColor }
                                            : {};
                                            
                                        let iconClasses = "w-8 h-8 transition-colors duration-200";
                                        if (!isSelected || !isConnected) {
                                            iconClasses += " grayscale";
                                        }

                                        return (
                                            <button
                                                key={platformKey}
                                                type="button"
                                                onClick={() => isConnected && togglePlatform(platformKey)}
                                                disabled={!isConnected || isPublished}
                                                title={!isConnected ? `Connect ${platformKey} on the Connections page` : `Click to publish to ${platformKey}`}
                                                className={`p-3 border rounded-lg flex items-center justify-center transition-all duration-200 h-16 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FFC2]
                                                    ${isSelected 
                                                        ? 'border-[#00FFC2] bg-teal-900/30 shadow-inner' 
                                                        : 'border-gray-700 bg-gray-800'
                                                    }
                                                    ${isConnected 
                                                        ? 'hover:border-[#00FFC2] hover:scale-105 active:scale-100 cursor-pointer' 
                                                        : 'opacity-60 cursor-not-allowed'
                                                    }
                                                    ${isPublished ? 'cursor-not-allowed hover:border-gray-700' : ''}
                                                `}
                                            >
                                                <Icon className={iconClasses} style={iconStyle} />
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.platform && <p className="text-red-500 text-xs mt-2">{errors.platform}</p>}
                            </div>

                            {/* Content Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                                <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                                    <button type="button" onClick={() => setContentType('image')} disabled={isPublished || (isContentTypeLocked && contentType !== 'image')} className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${contentType === 'image' ? 'bg-[#00FFC2] text-black font-bold' : 'text-gray-400 hover:bg-gray-700'}`}>Image</button>
                                    <button type="button" onClick={() => setContentType('reel')} disabled={isPublished || (isContentTypeLocked && contentType !== 'reel')} className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${contentType === 'reel' ? 'bg-[#00FFC2] text-black font-bold' : 'text-gray-400 hover:bg-gray-700'}`}>Reel</button>
                                    <button type="button" onClick={() => setContentType('video')} disabled={isPublished || (isContentTypeLocked && contentType !== 'video')} className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${contentType === 'video' ? 'bg-[#00FFC2] text-black font-bold' : 'text-gray-400 hover:bg-gray-700'}`}>Video</button>
                                </div>
                            </div>

                            {/* Caption */}
                            <div>
                                <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-1">Caption</label>
                                <textarea id="caption" value={caption} onChange={e => setCaption(e.target.value)} rows={5} readOnly={isPublished} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2] sm:text-sm disabled:bg-gray-700/50 disabled:cursor-not-allowed" placeholder="What's on your mind?"></textarea>
                                {errors.caption && <p className="text-red-500 text-xs mt-1">{errors.caption}</p>}
                            </div>
                            
                            {/* Auto Commenting Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Automation</label>
                                <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3">
                                    <div>
                                        <h4 className="font-semibold text-white">Auto Commenting</h4>
                                        <p className="text-xs text-gray-400">Automatically reply to comments using AI.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAutoCommenting(prev => !prev)}
                                        disabled={isPublished}
                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FFC2] focus:ring-offset-gray-900 ${autoCommenting ? 'bg-[#00FFC2]' : 'bg-gray-600'}`}
                                        role="switch"
                                        aria-checked={autoCommenting}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${autoCommenting ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>
                            </div>

                             {/* Scheduling */}
                             <div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center text-sm cursor-pointer">
                                        <input type="radio" name="publishMode" value="schedule"
                                               checked={publishMode === 'schedule'}
                                               onChange={() => setPublishMode('schedule')}
                                               disabled={isPublished}
                                               className="h-4 w-4 text-[#00FFC2] bg-gray-700 border-gray-600 focus:ring-[#00FFC2]" />
                                        <span className="ml-2 text-gray-300 font-medium">Schedule</span>
                                    </label>
                                     <label className="flex items-center text-sm cursor-pointer">
                                        <input type="radio" name="publishMode" value="now"
                                               checked={publishMode === 'now'}
                                               onChange={() => setPublishMode('now')}
                                               disabled={isPublished}
                                               className="h-4 w-4 text-[#00FFC2] bg-gray-700 border-gray-600 focus:ring-[#00FFC2]" />
                                        <span className="ml-2 text-gray-300 font-medium">Publish now</span>
                                         <InfoIcon className="w-4 h-4 text-gray-500 ml-1" title="Post will be published within the next minute."/>
                                    </label>
                                </div>
                                <div className={`transition-all duration-300 ease-in-out ${publishMode === 'schedule' ? 'max-h-96 opacity-100 mt-2 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="relative" ref={calendarRef}>
                                            <label className="sr-only">Date</label>
                                            <div 
                                                onClick={toggleCalendar}
                                                className={`flex items-center justify-between w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 cursor-pointer ${isPublished ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-600 focus:ring-2 focus:ring-[#00FFC2]/50 focus:border-[#00FFC2]'}`}
                                            >
                                                <div className="flex items-center text-gray-200 text-sm">
                                                     <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                     {scheduledAt.toLocaleDateString('en-GB')}
                                                </div>
                                            </div>
                                            
                                            {isCalendarOpen && calendarPos && createPortal(
                                                <div 
                                                    ref={popupRef}
                                                    style={{ 
                                                        position: 'fixed', 
                                                        top: calendarPos.top, 
                                                        left: calendarPos.left, 
                                                        zIndex: 9999 
                                                    }}
                                                    className="animate-fade-in z-[9999]"
                                                >
                                                    <Calendar 
                                                        selectedDate={scheduledAt} 
                                                        onChange={(d) => {
                                                            // preserve time
                                                            const newDate = new Date(d);
                                                            newDate.setHours(scheduledAt.getHours(), scheduledAt.getMinutes());
                                                            setScheduledAt(newDate);
                                                            setIsCalendarOpen(false);
                                                        }}
                                                        onClose={() => setIsCalendarOpen(false)}
                                                    />
                                                </div>,
                                                document.body
                                            )}
                                        </div>
                                        <TimePicker
                                            selectedTime={scheduledAt}
                                            onChange={setScheduledAt}
                                            disabled={isPublished}
                                        />
                                    </div>
                                    {errors.schedule && <p className="text-red-500 text-xs mt-2">{errors.schedule}</p>}
                                </div>
                             </div>
                        </div>
                    </div>
                </form>

                 <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end p-4 border-t border-white/10 flex-shrink-0 space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 bg-gray-900/50 rounded-b-xl">
                    {isPublished ? (
                        <button type="button" onClick={handleClose} className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600">Close</button>
                    ) : (
                        <>
                            <button type="button" onClick={() => handleSubmission('draft')} disabled={isUploading} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50">Save as Draft</button>
                            <button type="button" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50" disabled>Preview</button>
                            <button type="submit" form="post-editor-form" onClick={(e) => { e.preventDefault(); handleSubmission('scheduled'); }} disabled={isUploading} className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-black bg-[#00FFC2] rounded-lg hover:bg-teal-300 disabled:bg-gray-600 flex items-center justify-center min-w-[100px]">
                                {isUploading ? 'Saving...' : (publishMode === 'now' ? 'Publish' : 'Schedule')}
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};


const Schedule: React.FC = () => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [posts, setPosts] = React.useState<Post[]>([]);
    const [isWizardOpen, setIsWizardOpen] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState<Post | null>(null);
    const [initialWizardDate, setInitialWizardDate] = React.useState(new Date());
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUploading, setIsUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [connectedPlatforms, setConnectedPlatforms] = React.useState<SocialPlatform[]>([]);
    const [selectedDay, setSelectedDay] = React.useState(new Date());


    const startOfWeek = React.useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
        return new Date(date.setDate(diff));
    }, [currentDate]);
    
    React.useEffect(() => {
        setSelectedDay(currentDate);
    }, [currentDate]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }
            if (event.key === 'ArrowLeft') {
                changeWeek(-1);
            } else if (event.key === 'ArrowRight') {
                changeWeek(1);
            } else if (event.key.toLowerCase() === 't') {
                setCurrentDate(new Date());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) {
            setError("You must be logged in to see posts.");
            setIsLoading(false);
            return;
        }

        // Listener for connected platforms
        const connectionDocRef = db.collection('users').doc(user.uid).collection('connection').doc('connection');
        const unsubscribeConnections = connectionDocRef.onSnapshot(doc => {
            const connected: SocialPlatform[] = [];
            if (doc.exists) {
                const data = doc.data()!;
                if (data.Fb_ID) connected.push(SocialPlatform.FACEBOOK);
                if (data.Insta_ID) connected.push(SocialPlatform.INSTAGRAM);
                if (data.LinkedIn_Access_token) connected.push(SocialPlatform.LINKEDIN);
                if (data.Thread_Access) connected.push(SocialPlatform.THREADS);
            }
            setConnectedPlatforms(connected);
        });

        // Listener for posts
        const postsCol = db.collection('posts');
        const q = postsCol.where("userId", "==", user.uid);
        
        const unsubscribePosts = q.onSnapshot((querySnapshot: any) => {
            const postsData: Post[] = [];
            querySnapshot.forEach((doc: any) => {
                const data = doc.data();
                postsData.push({ 
                    id: doc.id,
                    ...data,
                    // Ensure scheduledAt is always a string in state
                    scheduledAt: data.scheduledAt.toDate().toISOString()
                } as Post);
            });
            setPosts(postsData);
            setIsLoading(false);
            setError(null);
        }, (err: any) => {
            console.error("Error fetching posts: ", err);
            setError("Failed to fetch posts. Check console for details.");
            setIsLoading(false);
        });

        return () => {
            unsubscribeConnections();
            unsubscribePosts();
        }
    }, []);
    
    const handleCreatePostClick = (date: Date) => {
        setEditingPost(null);
        setInitialWizardDate(date);
        setIsWizardOpen(true);
    };
    
    const handleEditPostClick = (post: Post) => {
        setEditingPost(post);
        setIsWizardOpen(true);
    };

    const handleDeletePost = async (post: Post) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
        
        try {
            // Delete media from storage
            if (post.mediaUrls.length > 0) {
                const deletePromises = post.mediaUrls.map(url => {
                    const fileRef = storage.refFromURL(url);
                    return fileRef.delete();
                });
                await Promise.all(deletePromises);
            }

            // Delete post from firestore
            await db.collection('posts').doc(post.id).delete();

        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please check the console.");
        }
    };


    const handleFormSubmit = async (postData: Omit<Post, 'id' | 'userId'>, newMediaFiles: File[], keptExistingUrls: string[]) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to create a post.");
            return;
        }
        setIsUploading(true);
        try {
            const newMediaUrls = await Promise.all(
                newMediaFiles.map(async file => {
                    const storageRef = storage.ref(`posts/${user.uid}/${Date.now()}_${file.name}`);
                    await storageRef.put(file);
                    return await storageRef.getDownloadURL();
                })
            );

            if (editingPost) {
                const urlsToDelete = editingPost.mediaUrls.filter(url => !keptExistingUrls.includes(url));
                if (urlsToDelete.length > 0) {
                    await Promise.all(urlsToDelete.map(url => storage.refFromURL(url).delete().catch(err => console.error(`Failed to delete old media ${url}`, err))));
                }
            }

            const finalMediaUrls = [...keptExistingUrls, ...newMediaUrls];
            const dataToSave = {
                ...postData,
                userId: user.uid,
                mediaUrls: finalMediaUrls,
                status: postData.status,
                // Access the global firebase object for Timestamp
                scheduledAt: (firebase as any).firestore.Timestamp.fromDate(new Date(postData.scheduledAt)),
                autoCommenting: postData.autoCommenting || false,
                contentType: postData.contentType,
            };

            if (editingPost) {
                // Update existing post
                const postRef = db.collection('posts').doc(editingPost.id);
                await postRef.update(dataToSave);
            } else {
                // Create new post
                await db.collection('posts').add(dataToSave);
            }

            setIsWizardOpen(false);
            setEditingPost(null);
        } catch (err) {
            console.error("Error saving post: ", err);
            alert("Failed to save post. Please check console for details.");
        } finally {
            setIsUploading(false);
        }
    };


    const weekDays = React.useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [startOfWeek]);

    const timeSlots = React.useMemo(() => {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            slots.push(`${i.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    const postsByDayAndSlot = React.useMemo(() => {
        const grid: { [key: string]: Post[] } = {};
        posts.forEach(post => {
            if (post.scheduledAt) {
                const date = new Date(post.scheduledAt);
                const hour = date.getHours();
                const minute = date.getMinutes();
                const isHalf = minute >= 30;
                // Key format: YYYY-MM-DD-HH-mm (mm is 00 or 30)
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hour}-${isHalf ? '30' : '00'}`;
                if (!grid[key]) grid[key] = [];
                grid[key].push(post);
            }
        });
        return grid;
    }, [posts]);

    const changeWeek = React.useCallback((amount: number) => {
        setCurrentDate(current => {
            const newDate = new Date(current);
            newDate.setDate(newDate.getDate() + amount * 7);
            return newDate;
        });
    }, []);
    
    return (
        <div className="p-4 md:p-6 lg:p-8 h-full flex flex-col text-gray-300">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <h1 className="text-2xl font-bold text-white">
                       {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                    </h1>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-semibold border border-white/10 rounded-md hover:bg-gray-800">Today</button>
                        <button onClick={() => changeWeek(1)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button onClick={() => handleCreatePostClick(new Date())} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-[#00FFC2] text-black rounded-lg font-semibold text-sm hover:bg-teal-300 transition-colors shadow-sm shadow-teal-500/30">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Post
                    </button>
                </div>
            </header>
            
            <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-gray-900/50 shadow-sm relative">
                {/* Mobile View */}
                <div className="md:hidden">
                    <div className="flex justify-around items-center border-b border-white/10 sticky top-0 bg-gray-900 z-10">
                        {weekDays.map(day => (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDay(day)}
                                className={`text-center py-2 px-1 w-full transition-colors duration-200 ${day.toDateString() === selectedDay.toDateString() ? 'border-b-2 border-[#00FFC2]' : 'border-b-2 border-transparent'}`}
                            >
                                <span className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className={`font-bold block text-lg mt-1 ${new Date().toDateString() === day.toDateString() ? 'bg-[#00FFC2] text-black rounded-full w-7 h-7 flex items-center justify-center mx-auto' : 'text-gray-300'}`}>{day.getDate()}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-2 space-y-2">
                        {timeSlots.map((time) => {
                             const [hourStr, minuteStr] = time.split(':');
                             const slotDate = new Date(selectedDay);
                             slotDate.setHours(parseInt(hourStr), parseInt(minuteStr), 0, 0);
                             const key = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}-${slotDate.getHours()}-${slotDate.getMinutes() < 30 ? '00' : '30'}`;
                             const dayPosts = postsByDayAndSlot[key] || [];

                             if (dayPosts.length === 0) return null;

                             return (
                                 <div key={time} className="flex items-start py-2 border-b border-white/10 last:border-b-0">
                                     <span className="text-xs text-gray-500 w-16 pt-1.5">{time}</span>
                                     <div className="flex-1 space-y-2">
                                         {dayPosts.map(post => (
                                            <div key={post.id} onClick={() => handleEditPostClick(post)} className="bg-gray-800 p-2 rounded-md border border-gray-700 flex space-x-3 items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-200">{post.caption || 'No Caption'}</p>
                                                    <div className="flex items-center text-xs text-gray-400 mt-1 capitalize">{post.status}</div>
                                                </div>
                                                {post.mediaUrls.length > 0 && (
                                                    <img src={post.mediaUrls[0]} alt="Post media" className="w-12 h-12 object-cover rounded"/>
                                                )}
                                            </div>
                                         ))}
                                     </div>
                                 </div>
                             );
                        })}
                         {posts.filter(p => new Date(p.scheduledAt).toDateString() === selectedDay.toDateString()).length === 0 && (
                            <div className="text-center py-16 text-gray-500">
                                <CalendarIcon className="w-12 h-12 mx-auto text-gray-700 mb-2"/>
                                <p>No posts scheduled for this day.</p>
                                <button onClick={() => handleCreatePostClick(selectedDay)} className="mt-4 text-sm font-semibold text-[#00FFC2] hover:underline">
                                    Schedule a post
                                </button>
                            </div>
                         )}
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-[auto_1fr] min-w-[800px]">
                    {/* Time Gutter */}
                    <div className="col-start-1 row-start-1 sticky top-0 bg-gray-900 z-10">
                        <div className="h-14 border-b border-r border-white/10"></div>
                    </div>
                    {/* Header */}
                    <div className="col-start-2 row-start-1 grid grid-cols-7 sticky top-0 bg-gray-900 z-10">
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="h-14 border-b border-white/10 flex flex-col items-center justify-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">{day.toLocaleString('default', { weekday: 'short' })}</span>
                                <span className={`text-xl font-semibold mt-1 ${new Date().toDateString() === day.toDateString() ? 'bg-[#00FFC2] text-black rounded-full w-8 h-8 flex items-center justify-center' : 'text-white'}`}>{day.getDate()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="col-start-1 row-start-2 border-r border-white/10 text-right">
                        {timeSlots.map(time => (
                            <div key={time} className="h-28 flex justify-end pr-2 pt-1 border-t border-gray-800 first:border-t-0">
                                <span className="text-xs text-gray-500">{time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="col-start-2 row-start-2 grid grid-cols-7">
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="border-l border-white/10">
                                {timeSlots.map((time) => {
                                    const [hourStr, minuteStr] = time.split(':');
                                    const slotDate = new Date(day);
                                    slotDate.setHours(parseInt(hourStr), parseInt(minuteStr), 0, 0);
                                    const key = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}-${slotDate.getHours()}-${slotDate.getMinutes() < 30 ? '00' : '30'}`;
                                    const dayPosts = postsByDayAndSlot[key] || [];

                                    return (
                                        <div key={time} className="h-28 border-t border-gray-800 p-1 group relative overflow-y-auto">
                                            {dayPosts.length > 0 ? (
                                                <div className="space-y-1">
                                                {dayPosts.map(post => {
                                                    const platform = post.platforms[0];
                                                    const PlatformIcon = platformDetails[platform]?.icon || FileIcon;
                                                    const statusStyles = {
                                                        scheduled: 'bg-sky-900/50 border-sky-700 text-sky-300 hover:border-sky-500',
                                                        published: 'bg-green-900/50 border-green-700 text-green-300 hover:border-green-500',
                                                        failed: 'bg-red-900/50 border-red-700 text-red-300 hover:border-red-500',
                                                        draft: 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600',
                                                        publishing: 'bg-yellow-900/50 border-yellow-700 text-yellow-300 hover:border-yellow-500'
                                                    };
                                                    const statusIcons = {
                                                        published: <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5 text-green-400"/>,
                                                        failed: <AlertTriangleIcon className="w-3.5 h-3.5 mr-1.5 text-red-400"/>,
                                                        scheduled: <PlatformIcon className="w-3.5 h-3.5 mr-1.5 text-sky-400"/>,
                                                        draft: <EditIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500"/>,
                                                        publishing: <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-yellow-400"/>,
                                                    };

                                                    return (
                                                        <div key={post.id} onClick={() => handleEditPostClick(post)} className={`relative group/post rounded p-1.5 text-xs overflow-hidden border cursor-pointer transition-all ${statusStyles[post.status] || statusStyles.draft}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center overflow-hidden">
                                                                    {statusIcons[post.status] || statusIcons.draft}
                                                                    <span className="font-semibold truncate">{post.caption || (post.status === 'draft' ? 'Draft' : 'No Caption')}</span>
                                                                </div>
                                                                <div className="absolute top-1 right-1 flex space-x-1 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-full p-1 z-20 shadow-md">
                                                                    <button onClick={(e) => { e.stopPropagation(); handleEditPostClick(post); }} className="p-1 hover:bg-gray-700 rounded-full text-gray-300 hover:text-white transition-colors" title="Edit"><EditIcon className="w-3 h-3"/></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post); }} className="p-1 hover:bg-red-900/50 rounded-full text-gray-300 hover:text-red-400 transition-colors" title="Delete"><TrashIcon className="w-3 h-3"/></button>
                                                                </div>
                                                            </div>
                                                            <p className="truncate pl-5 text-gray-400 mt-1">{post.caption}</p>
                                                        </div>
                                                    );
                                                })}
                                                </div>
                                            ) : (
                                                 <button onClick={() => handleCreatePostClick(slotDate)} className="w-full h-full rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800/80 flex items-center justify-center">
                                                     <PlusIcon className="w-5 h-5 text-gray-500" />
                                                 </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                 {isLoading && <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00FFC2]"></div></div>}
                 {error && <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-red-400">{error}</div>}
            </div>
            
            <PostEditorModal 
                isOpen={isWizardOpen} 
                onClose={() => { setIsWizardOpen(false); setEditingPost(null); }} 
                onSubmit={handleFormSubmit}
                initialData={editingPost}
                initialDate={initialWizardDate}
                isUploading={isUploading}
                connectedPlatforms={connectedPlatforms}
            />
        </div>
    );
};

export default Schedule;
