import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHuntStore } from '../store/useHuntStore';
import { huntService } from '../services/huntApi';
import { toast } from 'react-hot-toast';

const MyMaps = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [distances, setDistances] = useState({});

  const {
    progress,
    locations,
    setLocations,
    setLoading,
    isHuntActive
  } = useHuntStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        toast.error('Unable to get location');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!isHuntActive() || !userLocation) return;
      setLoading(true);
      try {
        const data = await huntService.getDashboard();
        setLocations(data.locations);
        const distMap = {};
        data.locations.forEach(loc => {
          if (loc.geo_lat && loc.geo_long && userLocation) {
            distMap[loc.id] = calculateDistance(
              userLocation.lat, userLocation.long,
              loc.geo_lat, loc.geo_long
            );
          }
        });
        setDistances(distMap);
      } catch (error) {
        console.error('Map fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  if (!isHuntActive()) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] shadow-lg text-center max-w-md">
          <span className="text-4xl mb-4 block">🏴‍☠️</span>
          <p className="text-[var(--color-muted)] mb-4">Start the hunt first!</p>
          <button
            onClick={() => navigate('/hunt')}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl font-bold shadow-[var(--shadow-gold)]"
          >
            Go to Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                <span>🗺️</span> Hunt Map
              </h1>
              <p className="text-[var(--color-muted)] text-xs">Find your next location</p>
            </div>
            <button
              onClick={() => navigate('/hunt')}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        {/* User Location Badge */}
        {userLocation && (
          <div className="bg-[var(--color-info-bg)] border border-[var(--color-info-bg)] rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm text-[var(--color-info)] font-medium">Your Location</p>
              <p className="text-xs text-[var(--color-muted)]">
                Lat: {userLocation.lat.toFixed(4)}, Long: {userLocation.long.toFixed(4)}
                <span className="ml-2 text-[var(--color-muted-light)]">(±{Math.round(userLocation.accuracy)}m)</span>
              </p>
            </div>
          </div>
        )}

        {/* Location Cards */}
        <div className="space-y-4">
          {locations.map((location) => {
            const distance = distances[location.id];
            const isUnlocked = location.level <= (progress?.current_level || 0);
            const isNext = location.level === (progress?.current_level || 0) + 1;
            const isWithinRange = distance !== undefined && distance <= (location.geo_radius_meters || 100);

            return (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
                className={`bg-[var(--color-surface)] rounded-2xl border p-5 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  isUnlocked
                    ? 'border-[var(--color-success)] bg-[var(--color-success-bg)]/30'
                    : isNext
                    ? 'border-[var(--color-primary)] border-2'
                    : 'border-[var(--color-border)] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isUnlocked ? 'bg-[var(--color-success)] text-white' : 
                      isNext ? 'bg-[var(--color-primary)] text-white' : 
                      'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                    }`}>
                      <span className="text-xl">
                        {isUnlocked ? '✅' : isNext ? '🎯' : '🔒'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[var(--color-text)]">
                          Level {location.level}: {location.name}
                        </h3>
                        {isNext && (
                          <span className="bg-[var(--color-warning)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            NEXT
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--color-muted)] text-sm mt-0.5">
                        {isUnlocked ? 'Completed' : isNext ? 'Go here now!' : 'Locked'}
                      </p>
                    </div>
                  </div>

                  {distance !== undefined && (
                    <div className={`text-right px-3 py-1 rounded-lg ${
                      isWithinRange 
                        ? 'bg-[var(--color-success)] text-white' 
                        : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                    }`}>
                      <p className="font-bold text-sm">{distance}m</p>
                      <p className="text-xs opacity-80">away</p>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedLocation === location.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                    {isNext && (
                      <>
                        <div className="bg-[var(--color-bg-alt)] rounded-xl p-4 mb-3 border border-[var(--color-border-light)]">
                          <p className="text-[var(--color-primary)] font-bold text-sm mb-2 flex items-center gap-1">
                            <span>🗝️</span> Clue
                          </p>
                          <p className="text-[var(--color-text)] text-sm font-medium">{location.clue_text_english}</p>
                          <p className="text-[var(--color-muted)] text-xs mt-2">{location.clue_text_tamil}</p>
                        </div>

                        {location.hint_image_url && (
                          <img 
                            src={location.hint_image_url}
                            alt="Location hint"
                            className="w-full h-48 object-cover rounded-xl mb-3 border border-[var(--color-border)]"
                          />
                        )}

                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-3 bg-[var(--color-bg-alt)] rounded-lg p-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Coords: {location.geo_lat}, {location.geo_long}</span>
                        </div>

                        {isWithinRange ? (
                          <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 rounded-xl p-4 text-center">
                            <p className="text-[var(--color-success)] font-bold mb-2 flex items-center justify-center gap-1">
                              <span>✨</span> You are here!
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/scan');
                              }}
                              className="bg-[var(--color-success)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
                            >
                              Scan Location QR
                            </button>
                          </div>
                        ) : (
                          <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-xl p-4">
                            <p className="text-[var(--color-danger)] text-sm flex items-center gap-1">
                              <span>⚠️</span>
                              You are {distance}m away. Get within {location.geo_radius_meters || 100}m to scan.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {isUnlocked && (
                      <div className="bg-[var(--color-success-bg)] rounded-xl p-3 text-center border border-[var(--color-success)]/10">
                        <p className="text-[var(--color-success)] text-sm font-medium">✅ Level completed! Reward claimed.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Embed */}
        {userLocation && locations.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-[var(--color-text)] mb-3">Live Map</h3>
            <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm aspect-video">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  Math.min(...locations.map(l => l.geo_long)) - 0.01
                }%2C${
                  Math.min(...locations.map(l => l.geo_lat)) - 0.01
                }%2C${
                  Math.max(...locations.map(l => l.geo_long)) + 0.01
                }%2C${
                  Math.max(...locations.map(l => l.geo_lat)) + 0.01
                }&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.long}`}
                className="grayscale-[30%]"
              />
            </div>
            <p className="text-[var(--color-muted)] text-xs mt-2 text-center">
              💡 Tip: Use Google Maps on your phone for turn-by-turn navigation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMaps;