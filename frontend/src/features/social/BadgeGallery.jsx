import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBadges } from '../../store/socialSlice';
import * as socialApi from '../../api/social.api';

// Icon mapping fallback for badges
const BADGE_ICONS = {
  'Eco Warrior': '🏆',
  'Green Champion': '🌿',
  'Challenge Master': '🎯',
  'Point Millionaire': '💎',
  'Green Beginner': '🌱',
  'Carbon Saver': '👣',
  'Sustainability Champion': '🌍',
  'Team Player': '🤝'
};

export default function BadgeGallery() {
  const dispatch = useDispatch();
  const { myBadges, loading } = useSelector((s) => s.social);
  const [allBadges, setAllBadges] = React.useState([]);

  useEffect(() => {
    dispatch(fetchMyBadges());
    // Fetch all badges to display locked states as well
    socialApi.getAllBadges()
      .then(res => setAllBadges(res.data || []))
      .catch(err => console.error(err));
  }, [dispatch]);

  const earnedNames = myBadges.map(b => b.name);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🏅 <span>Badge Gallery</span>
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Unlock badges by completing environmental challenges and participating in CSR activities.
      </p>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : allBadges.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No badges defined in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedNames.includes(badge.name);
            const icon = BADGE_ICONS[badge.name] || '🏅';
            return (
              <div
                key={badge._id}
                className={`relative rounded-2xl p-5 border text-center transition-all duration-300 flex flex-col items-center justify-between
                  ${isEarned
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/30 border-amber-200 shadow-sm hover:shadow-md'
                    : 'bg-gray-50/50 border-gray-150 opacity-60 filter grayscale'
                  }`}
              >
                {/* Lock indicator */}
                {!isEarned && (
                  <span className="absolute top-3 right-3 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                    🔒 Locked
                  </span>
                )}
                {isEarned && (
                  <span className="absolute top-3 right-3 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                    ✨ Unlocked
                  </span>
                )}

                <div className="text-4xl my-3">{icon}</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{badge.description}</div>
                <div className="mt-3 text-[10px] uppercase font-bold tracking-wider text-amber-700">
                  {badge.unlock_rule?.type === 'xp' && `Reach ${badge.unlock_rule.value} XP`}
                  {badge.unlock_rule?.type === 'points' && `Earn ${badge.unlock_rule.value} points`}
                  {badge.unlock_rule?.type === 'csr_count' && `Complete ${badge.unlock_rule.value} CSR activities`}
                  {badge.unlock_rule?.type === 'challenge_count' && `Finish ${badge.unlock_rule.value} challenges`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
