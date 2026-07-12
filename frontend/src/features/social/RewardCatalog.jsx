import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRewards,
  redeemReward,
  clearError,
  clearSuccess,
} from '../../store/socialSlice';

// Confirm Redeem Modal
function RedeemModal({ reward, userPoints, onConfirm, onCancel }) {
  const canAfford = userPoints >= reward.points_required;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🎁</div>
          <h3 className="text-xl font-bold text-gray-900">{reward.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{reward.description}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cost</span>
            <span className="font-bold text-purple-700">💎 {reward.points_required} pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Your Balance</span>
            <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
              💎 {userPoints} pts
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
            <span className="text-gray-500">After Redemption</span>
            <span className={`font-bold ${canAfford ? 'text-gray-700' : 'text-red-500'}`}>
              💎 {canAfford ? (userPoints - reward.points_required).toLocaleString() : '—'} pts
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-600 text-sm font-medium">
              You need {(reward.points_required - userPoints).toLocaleString()} more points
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            disabled={!canAfford}
            onClick={onConfirm}
            className="flex-1 py-2.5 font-medium rounded-xl text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Redeem Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Reward Card
function RewardCard({ reward, userPoints, onRedeem }) {
  const canAfford = userPoints >= reward.points_required;
  const outOfStock = reward.stock <= 0;
  const lowStock = reward.stock > 0 && reward.stock <= 5;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col
      ${outOfStock ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}
    >
      {/* Image / placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
        {reward.imageUrl ? (
          <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🎁</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-gray-800/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {lowStock && !outOfStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Only {reward.stock} left!
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-purple-700 transition-colors">
          {reward.name}
        </h3>
        {reward.description && (
          <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{reward.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">💎</span>
            <div>
              <span className="font-bold text-lg text-purple-700">{reward.points_required.toLocaleString()}</span>
              <span className="text-xs text-gray-400 ml-1">pts</span>
            </div>
          </div>
          <button
            onClick={() => !outOfStock && onRedeem(reward)}
            disabled={outOfStock}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm
              ${outOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : canAfford
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {outOfStock ? 'Sold Out' : canAfford ? 'Redeem' : 'Not enough pts'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RewardCatalog() {
  const dispatch = useDispatch();
  const { rewards, loading, error, successMessage, actionLoading } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [selectedReward, setSelectedReward] = useState(null);
  const [search, setSearch] = useState('');

  const userPoints = user?.points || 0;

  useEffect(() => {
    dispatch(fetchRewards());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) setTimeout(() => dispatch(clearSuccess()), 3000);
    if (error) setTimeout(() => dispatch(clearError()), 4000);
  }, [successMessage, error, dispatch]);

  const handleRedeem = async () => {
    if (!selectedReward) return;
    await dispatch(redeemReward(selectedReward._id));
    setSelectedReward(null);
    dispatch(fetchRewards()); // Refresh stock count
  };

  const filtered = rewards.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-50 p-6">
      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-40 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Redeem Confirm Modal */}
      {selectedReward && (
        <RedeemModal
          reward={selectedReward}
          userPoints={userPoints}
          onConfirm={handleRedeem}
          onCancel={() => setSelectedReward(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              🎁 <span>Reward Catalog</span>
            </h1>
            <p className="text-gray-500 text-sm">Redeem your points for exclusive rewards</p>
          </div>

          {/* User Balance card */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-6 py-4 text-center">
            <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Your Balance</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">💎</span>
              <span className="text-2xl font-black text-purple-700">{userPoints.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">points available</div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Search rewards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white w-72"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🎁</p>
          <p className="text-lg font-medium">No rewards found</p>
          <p className="text-sm mt-1">Check back soon for new rewards</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((reward) => (
            <RewardCard
              key={reward._id}
              reward={reward}
              userPoints={userPoints}
              onRedeem={setSelectedReward}
            />
          ))}
        </div>
      )}
    </div>
  );
}
