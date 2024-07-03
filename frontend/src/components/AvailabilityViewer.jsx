import React from 'react';
import './AvailabilityViewer.css';

export function AvailabilityViewer({ userId, responded, available }) {
    // Filter and convert responded array into a set
    const respondedSet = new Set(responded.filter(email => !email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)));

    // Convert available array into a set
    const availableSet = new Set(available);

    return (
        <div className="availability-viewer">
            <div className="availability-header">Available:</div>
            <div className="availability-list">
                {[...respondedSet].map(userId => (
                    <div
                        key={userId}
                        className={`respondent ${availableSet.has(userId) ? 'available' : 'unavailable'}`}
                    >
                        {userId}
                    </div>
                ))}
                <div className={`respondent ${availableSet.has(userId) ? 'available' : 'unavailable'}`}>
                    You
                </div>
            </div>
        </div>
    );
}
