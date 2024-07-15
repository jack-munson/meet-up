import React from 'react';
import './AvailabilityViewer.css';

export function AvailabilityViewer({ userId, responded, available }) {
    console.log(available)
    console.log(userId)
    const respondedSet = new Set(Object.keys(responded));

    const availableSet = new Set(available);

    return (
        <div className="availability-viewer">
            <div className="availability-header">Available ({availableSet.size}/{respondedSet.size}):</div>
            <div className="availability-list">
                {[...respondedSet].map(id => (
                    <div
                        key={id}
                        className={`respondent ${availableSet.has(id) ? 'available' : 'unavailable'}`}
                    >
                        {id === userId ? "You" : responded[id].name}
                    </div>
                ))}
            </div>
        </div>
    );
}
