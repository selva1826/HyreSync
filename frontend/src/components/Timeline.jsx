import { useState, useEffect } from 'react';
import api from '../utils/api';

function Timeline({ applicationId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [applicationId]);

  const fetchTimeline = async () => {
    try {
      const { data } = await api.get(`/applications/${applicationId}`);
      setTimeline(data.timeline || []);
      setLoading(false);
    } catch (error) {
      console.error('Timeline fetch error:', error);
      setLoading(false);
    }
  };

  const getActorIcon = (actorType) => {
    switch (actorType) {
      case 'applicant': return '👤';
      case 'admin': return '👨‍💼';
      case 'bot_mimic': return '🤖';
      default: return '📝';
    }
  };

  const getActorColor = (actorType) => {
    switch (actorType) {
      case 'applicant': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'bot_mimic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Activity Timeline</h3>
      
      <div className="relative space-y-6 pl-8">
        {timeline.map((event, index) => (
          <div key={event._id} className="relative timeline-item animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Timeline dot */}
            <div className={`absolute -left-8 w-4 h-4 rounded-full ${getActorColor(event.actor.type)} flex items-center justify-center`}>
              <span className="text-xs">{getActorIcon(event.actor.type)}</span>
            </div>

            {/* Event card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActorColor(event.actor.type)}`}>
                    {event.actor.name}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              {event.details && (
                <div className="mt-3 space-y-2">
                  {event.details.fromStatus && event.details.toStatus && (
                    <p className="text-sm text-gray-700">
                      Status changed: <span className="font-medium">{event.details.fromStatus}</span> → 
                      <span className="font-medium text-primary"> {event.details.toStatus}</span>
                    </p>
                  )}
                  
                  {event.details.score && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm font-semibold text-gray-800">
                        Score: {event.details.score}/100
                      </p>
                      {event.details.reasoning && (
                        <p className="text-xs text-gray-600 mt-1">{event.details.reasoning}</p>
                      )}
                    </div>
                  )}

                  {event.details.comment && (
                    <p className="text-sm text-gray-600 italic">
                      "{event.details.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {timeline.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No activity yet
        </div>
      )}
    </div>
  );
}

export default Timeline;
