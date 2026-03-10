import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, ChevronLeft, Leaf, Fish, Droplets, Wind } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Observation.css';
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const CATEGORIES = [
    { id: 'Flora', label: 'Plants & Flora', icon: <Leaf size={32} /> },
    { id: 'Fauna', label: 'Animals & Fauna', icon: <Fish size={32} /> },
    { id: 'Water', label: 'Water Health', icon: <Droplets size={32} /> },
    { id: 'Air', label: 'Air Quality', icon: <Wind size={32} /> },
];

const Observation = ({ onSuccess }) => {
    const { addLog, currentUser } = useAppContext();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [notes, setNotes] = useState('');
    const [locationName, setLocationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    // Stop camera stream safely
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    // Initialize camera
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setPermissionError(false);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setPermissionError(true);
        }
    }, [videoRef]);

    useEffect(() => {
        if (selectedCategory && !photo && !permissionError) {
            startCamera();
        }
        return () => {
            // Cleanup on unmount or category change
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [selectedCategory, photo, startCamera, permissionError]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleBackToCategories = () => {
        stopCamera();
        setSelectedCategory(null);
        setPhoto(null);
        setNotes('');
        setLocationName('');
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPhoto(dataUrl);
            stopCamera();
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        startCamera();
    };

    const handleSubmit = async () => {
        if (!photo || !selectedCategory) return;
        setIsSubmitting(true);

 try {
        // Upload observation to Firestore
        const docRef = await addDoc(collection(db, "observations"), {
            imageUrl: photo,
            notes: notes || "No notes provided.",
            location: {
                name: locationName || "Unknown Location",
                lat: 0,
                lng: 0
            },
            aiAnalysis: {
                category: selectedCategory.id,
                confidence: 0.95,
                culturalContext: {
                    'en': `AI note: Analyzed new ${selectedCategory.label} field snapshot.`
                }
            },
            timestamp: serverTimestamp(),
            userId: currentUser.uid 
        });

        console.log("Observation saved with ID:", docRef.id);
    } catch (err) {
        console.error("Error saving observation:", err);
    }
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
    };

    if (permissionError) {
        return (
            <div className="observation-container error-state animate-fade-in">
                <div className="glass-panel p-6 text-center">
                    <Camera size={48} className="mx-auto mb-4 text-muted" opacity={0.5} />
                    <h3>Camera Access Required</h3>
                    <p className="mb-4">Please allow camera access in your browser to make observations.</p>
                    <button className="primary-button mb-4" onClick={startCamera}>Try Again</button>
                    <button className="secondary-button" onClick={handleBackToCategories}>Back to Categories</button>
                </div>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="observation-container category-selection-view animate-fade-in">
                <div className="category-header">
                    <h2>New Observation</h2>
                    <p>What are you recording in the field today?</p>
                </div>

                <div className="category-grid">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className="category-select-card glass-panel"
                            onClick={() => handleCategorySelect(cat)}
                        >
                            <div className={`cat-icon-wrapper cat-${cat.id.toLowerCase()}`}>
                                {cat.icon}
                            </div>
                            <h3>{cat.label}</h3>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="observation-container animate-fade-in">
            {!photo ? (
                <div className="camera-view">
                    <div className="camera-top-bar">
                        <button className="icon-button back-btn-camera glass-panel" onClick={handleBackToCategories}>
                            <ChevronLeft size={24} />
                        </button>
                        <span className="camera-category-badge glass-panel">{selectedCategory.label}</span>
                    </div>

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="camera-video"
                    />
                    <div className="camera-overlay">
                        <div className="camera-frame"></div>
                        <p className="camera-hint">Center subject in frame</p>
                    </div>
                    <div className="camera-controls">
                        <button className="capture-button" onClick={handleCapture}>
                            <div className="capture-inner"></div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="review-view flex flex-col h-full">
                    <div className="preview-container">
                        <img src={photo} alt="Preview" className="photo-preview" />
                        <button className="retake-button glass-panel" onClick={handleRetake}>
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    <div className="details-form p-4 flex-1">
                        <div className="mb-4 details-header-row">
                            <h3 className="m-0">Observation Details</h3>
                            <span className="form-category-badge">{selectedCategory.label}</span>
                        </div>

                        <div className="form-group mb-4">
                            <label>Location Area</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Jakarta Bay, Marina Barrage"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label>Field Notes</label>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder={`Any details about the ${selectedCategory.id.toLowerCase()}?`}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="submission-bar glass-panel p-4">
                        <button
                            className="primary-button w-full flex items-center justify-center gap-2"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><RefreshCw className="animate-spin" size={20} /> Analyzing with AI...</>
                            ) : (
                                <><CheckCircle2 size={20} /> Save & Analyze</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default Observation;
