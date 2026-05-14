import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, CheckCircle, Users, AlertCircle, Loader2, BookOpen, ChevronDown } from 'lucide-react';
import axios from 'axios';

const MOCK_SUBJECTS = ["Data Structures", "Operating Systems", "Python Programming", "Java Development", "Computer Networks"];

const PhotoAttendance = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subject, setSubject] = useState(MOCK_SUBJECTS[0]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResults(null);
      setError(null);
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDims({ width: naturalWidth, height: naturalHeight });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setResults(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subject', subject);

    try {
      const response = await axios.post('http://localhost:8000/api/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.code === 200) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading classroom photo. Check backend connection.');
    } finally {
      setUploading(false);
    }

  };

  const renderBoundingBoxes = () => {
    if (!results || !results.recognized || !imgRef.current || imgDims.width === 0) return null;

    const displayWidth = imgRef.current.clientWidth;
    const displayHeight = imgRef.current.clientHeight;
    
    const scaleX = displayWidth / imgDims.width;
    const scaleY = displayHeight / imgDims.height;

    return results.recognized.map((item, idx) => {
      const [top, right, bottom, left] = item.location;
      
      const style = {
        position: 'absolute',
        top: `${top * scaleY}px`,
        left: `${left * scaleX}px`,
        width: `${(right - left) * scaleX}px`,
        height: `${(bottom - top) * scaleY}px`,
        border: item.usn === 'Unknown' ? '2px solid var(--accent-danger)' : '2px solid var(--accent-success)',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        zIndex: 5,
        pointerEvents: 'none'
      };

      return (
        <div key={idx} style={style}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-2px',
            background: item.usn === 'Unknown' ? 'var(--accent-danger)' : 'var(--accent-success)',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            borderRadius: '2px 2px 0 0'
          }}>
            {item.usn} {item.confidence > 0 && `(${item.confidence}%)`}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="photo-attendance-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header">
        <div>
          <h2 className="page-title">Photo Attendance</h2>
          <p className="page-subtitle">Instant AI detection with spatial verification.</p>
        </div>
      </header>

      {/* Control Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Select Subject:</span>
          </div>
          <div className="select-wrapper" style={{ flex: 1, maxWidth: '300px' }}>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              style={{ 
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.1)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '0.5rem 1rem', 
                width: '100%', 
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              {MOCK_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={18} />
          {selectedFile ? 'Change Photo' : 'Select Photo'}
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </label>

        <button 
          className="btn-primary" 
          disabled={!selectedFile || uploading}
          onClick={handleUpload}
          style={{ width: '160px' }}
        >
          {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Process AI'}
        </button>
      </div>

      <div className="attendance-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <div className="upload-section">
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {preview ? (
              <div style={{ width: '100%', position: 'relative', display: 'inline-block' }}>
                <img 
                  ref={imgRef}
                  src={preview} 
                  alt="Classroom Preview" 
                  onLoad={handleImageLoad}
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '600px', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>No Photo Selected</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Upload a classroom picture to start AI detection.</p>
              </div>
            )}
          </div>
        </div>

        <div className="results-sidebar">
          <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3>Detection Analysis</h3>
            
            {error && (
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {results ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="mini-stat glass-panel" style={{ padding: '1rem' }}>
                    <span className="mini-stat-value">{results.total_detected}</span>
                    <span className="mini-stat-label">Faces</span>
                  </div>
                  <div className="mini-stat glass-panel" style={{ padding: '1rem' }}>
                    <span className="mini-stat-value" style={{ color: 'var(--accent-success)' }}>
                      {results.recognized.filter(r => r.usn !== 'Unknown').length}
                    </span>
                    <span className="mini-stat-label">Matches</span>
                  </div>
                </div>

                <div className="results-list">
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Identified Matches</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {results.recognized.map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem', 
                        background: item.usn === 'Unknown' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)', 
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: `3px solid ${item.usn === 'Unknown' ? 'var(--accent-danger)' : 'var(--accent-success)'}`
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.usn}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.usn === 'Unknown' ? 'No record found' : 'Student Verified'}
                          </span>
                        </div>
                        {item.confidence > 0 && (
                          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--accent-success)' }}>
                            {item.confidence}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
                <Users size={48} style={{ marginBottom: '1rem' }} />
                <p>Awaiting upload...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoAttendance;
