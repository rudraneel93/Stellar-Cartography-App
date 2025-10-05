import { useState, useEffect } from 'react';
import { fetchNASA_ConstellationImage, getNASA_AvailableSurveys } from '../utils/api';
import './NASASkyView.css';

interface NASASkyViewProps {
  constellationName: string;
  centerRA: number;
  centerDec: number;
  onClose: () => void;
}

export default function NASASkyView({ constellationName, centerRA, centerDec, onClose }: NASASkyViewProps) {
  const [imageData, setImageData] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState('DSS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const surveys = getNASA_AvailableSurveys();

  useEffect(() => {
    loadImage();
  }, [constellationName, centerRA, centerDec, selectedSurvey]);

  const loadImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNASA_ConstellationImage(constellationName, centerRA, centerDec, selectedSurvey);
      setImageData(data);
    } catch (err) {
      setError('Failed to load NASA telescope image');
      console.error('NASA SkyView error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nasa-skyview-modal">
      <div className="nasa-skyview-container">
        <div className="nasa-skyview-header">
          <div className="header-content">
            <h2>🛰️ NASA Telescope View: {constellationName}</h2>
            <p className="nasa-attribution">
              Powered by <strong>NASA SkyView Virtual Observatory</strong>
            </p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="nasa-skyview-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading NASA telescope image...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={loadImage}>Retry</button>
            </div>
          )}

          {!loading && !error && imageData && (
            <>
              <div className="image-container">
                <img
                  src={imageData.imageUrl}
                  alt={`NASA telescope view of ${constellationName}`}
                  className="sky-image"
                  onError={() => setError('Image failed to load')}
                />
                <div className="image-overlay">
                  <span className="survey-badge">{imageData.survey}</span>
                </div>
              </div>

              <div className="image-info">
                <div className="info-row">
                  <span className="info-label">📍 Position:</span>
                  <span className="info-value">
                    RA: {imageData.position.ra.toFixed(3)}h, Dec: {imageData.position.dec.toFixed(3)}°
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">🔭 Field of View:</span>
                  <span className="info-value">{imageData.fieldOfView.toFixed(2)}°</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🛰️ Source:</span>
                  <span className="info-value">{imageData.source}</span>
                </div>
              </div>

              <div className="survey-selector">
                <label>Select Survey Type:</label>
                <div className="survey-buttons">
                  {surveys.map((survey) => (
                    <button
                      key={survey.code}
                      className={`survey-button ${selectedSurvey === survey.code ? 'active' : ''}`}
                      onClick={() => setSelectedSurvey(survey.code)}
                      title={`${survey.description} - ${survey.wavelength}`}
                    >
                      {survey.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nasa-footer">
                <p>
                  <strong>About NASA SkyView:</strong> This image is generated from NASA's archive of 
                  astronomical surveys covering the entire sky in multiple wavelengths. The Digitized 
                  Sky Survey (DSS) provides optical observations from ground-based telescopes.
                </p>
                <a
                  href="https://skyview.gsfc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nasa-link"
                >
                  Learn more about NASA SkyView →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
