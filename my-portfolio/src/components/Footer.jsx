import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Footer.css';

function Footer({ designerName = 'Abhay Chaudhary' }) {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = 'http://localhost:3000/api/visitor-count';

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchVisitorCount = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setVisitorCount(data.count || 0);
      } catch (err) {
        console.error('Error fetching visitor count:', err.message);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
          setTimeout(fetchVisitorCount, retryDelay);
        } else {
          setError('Unable to load visitor count. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const recordVisit = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ increment: true }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setVisitorCount(data.count || 0);
      } catch (err) {
        console.error('Error recording visit:', err.message);
        // No retry for POST to avoid duplicate increments
        setError('Unable to record visit.');
      }
    };

    fetchVisitorCount();
    recordVisit();
  }, []);

  return (
    <footer className="footer bg-glass text-center py-4 mt-auto">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0 text-md">
            Designed by <span className="text-primary">{designerName}</span>
          </p>
          <div className="visitor-counter d-flex align-items-center gap-2">
            <span className="text-md">
              {isLoading ? (
                <span>Loading visits...</span>
              ) : error ? (
                <span className="text-muted">Visitor count unavailable</span>
              ) : (
                <>
                  <i className="fas fa-users mr-2"></i>
                  Visitors: <span className="font-weight-bold">{visitorCount.toLocaleString()}</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;