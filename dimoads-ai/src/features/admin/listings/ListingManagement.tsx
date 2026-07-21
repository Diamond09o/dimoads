/**
 * Listing Management Subsystem Component
 */
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  EyeOff, 
  Eye, 
  TrendingUp, 
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  DollarSign,
  Edit3
} from 'lucide-react';
import { Listing, Category } from '../../../types';
import { AdminService } from '../services/adminService';

interface ListingManagementProps {
  listings: Listing[];
  onUpdateListings: (updatedListings: Listing[]) => void;
  language: 'en' | 'ar';
}

export default function ListingManagement({ 
  listings, 
  onUpdateListings, 
  language 
}: ListingManagementProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'active' | 'suspended' | 'sold'>('all');
  const [inspectListingId, setInspectListingId] = useState<string | null>(null);

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || l.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUpdateStatus = (listingId: string, status: 'pending' | 'active' | 'suspended') => {
    const list = [...listings];
    const item = list.find(l => l.id === listingId);
    if (item) {
      item.status = status;
      onUpdateListings(list);
      AdminService.logAction(
        status === 'active' ? 'approve_listing' : status === 'suspended' ? 'delete_listing' : 'edit_listing',
        `Listing ID ${listingId} ("${item.title}") status changed to: ${status}`
      );
    }
  };

  const handleTogglePremium = (listingId: string) => {
    const list = [...listings];
    const item = list.find(l => l.id === listingId);
    if (item) {
      item.isPremium = !item.isPremium;
      onUpdateListings(list);
      AdminService.logAction('edit_listing', `Toggled Premium status for listing ID ${listingId} to: ${item.isPremium}`);
    }
  };

  const handleDelete = (listingId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this listing from database?')) {
      const list = listings.filter(l => l.id !== listingId);
      onUpdateListings(list);
      AdminService.logAction('delete_listing', `Permanently deleted listing ID ${listingId}`);
      if (inspectListingId === listingId) setInspectListingId(null);
    }
  };

  const activeInspect = inspectListingId ? listings.find(l => l.id === inspectListingId) : null;

  return (
    <div id="admin_listings_manager" className="space-y-6">
      
      {/* Search and Filters Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'البحث في الإعلانات...' : 'Search listings by title, location...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select 
              value={selectedCategory} 
              onChange={(e: any) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none font-bold text-gray-600 focus:outline-none uppercase"
            >
              <option value="all">All Categories</option>
              <option value="vehicles">Vehicles</option>
              <option value="real-estate">Real Estate</option>
              <option value="jobs">Jobs</option>
              <option value="electronics">Electronics</option>
              <option value="services">Services</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl text-xs">
            <select 
              value={selectedStatus} 
              onChange={(e: any) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none font-bold text-gray-600 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="suspended">Suspended / Hidden</option>
              <option value="sold">Marked Sold</option>
            </select>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main listings list */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'جميع إعلانات المنصة' : 'Platform Classified Ads Feed'} ({filteredListings.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Ad Title / ID</th>
                  <th className="px-5 py-3">Category / Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Moderation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((l) => (
                  <tr 
                    key={l.id} 
                    className={`hover:bg-gray-50/50 cursor-pointer ${inspectListingId === l.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setInspectListingId(l.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        {l.isPremium && (
                          <span className="text-amber-500 font-extrabold flex items-center" title="Premium Boost Active">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </span>
                        )}
                        <span className="truncate max-w-[180px]">{l.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-semibold font-mono">{l.id} • {l.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold uppercase text-gray-500 text-[10px]">{l.category}</div>
                      <div className="font-mono font-extrabold text-gray-900">${l.price.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        l.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : l.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        {l.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(l.id, 'active')}
                            title="Approve & Publish Ad"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {l.status !== 'suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(l.id, 'suspended')}
                            title="Reject/Hide Ad"
                            className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePremium(l.id)}
                          title="Toggle Premium Boost badge"
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            l.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          title="Delete permanently"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredListings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">
                      No matching classified ads found in archive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected listing details / images view panel */}
        <div className="lg:col-span-1">
          {activeInspect ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 animate-slideLeft">
              
              {/* Media gallery */}
              {activeInspect.images && activeInspect.images.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
                  <img 
                    src={activeInspect.images[0]} 
                    alt={activeInspect.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>{activeInspect.images.length} images</span>
                  </div>
                  {activeInspect.video && (
                    <div className="absolute bottom-2.5 left-2.5 bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <VideoIcon className="w-3 h-3" />
                      <span>Has Video</span>
                    </div>
                  )}
                </div>
              )}

              {/* Title & info */}
              <div>
                <h4 className="text-sm font-extrabold text-gray-950 mb-1">{activeInspect.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-h-24 overflow-y-auto">{activeInspect.description}</p>
              </div>

              {/* Static Stats */}
              <div className="grid grid-cols-2 gap-3 text-center border-t border-b border-gray-100 py-3">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Views Counter</span>
                  <span className="font-mono text-xs font-extrabold text-gray-900">{activeInspect.viewsCount || 0} hits</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Ad Valuation</span>
                  <span className="font-mono text-xs font-extrabold text-amber-700">${activeInspect.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Artificial Intelligence tags generated in Phase 6 */}
              {activeInspect.aiTags && activeInspect.aiTags.length > 0 && (
                <div>
                  <span className="block text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Gemini Generated Meta Tags</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeInspect.aiTags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-md text-[9px] uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact metadata */}
              <div className="space-y-1.5 text-[11px] text-gray-600 bg-gray-50 p-3.5 rounded-2xl">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                  Contact details
                </span>
                <div>Email: <span className="font-mono font-bold text-gray-900">{activeInspect.contactOptions?.email || 'N/A'}</span></div>
                <div>Phone: <span className="font-mono font-bold text-gray-900">{activeInspect.contactOptions?.phone || 'N/A'}</span></div>
                <div>WhatsApp: <span className="font-mono font-bold text-gray-900">{activeInspect.contactOptions?.whatsapp || 'N/A'}</span></div>
              </div>

              {/* Quick Actions Override */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const price = Number(prompt('Enter adjusted classified listing price ($):', String(activeInspect.price)));
                    if (price) {
                      const list = [...listings];
                      const item = list.find(l => l.id === activeInspect.id);
                      if (item) {
                        item.price = price;
                        onUpdateListings(list);
                        AdminService.logAction('edit_listing', `Manually overrode listing price of ${item.id} to $${price}`);
                      }
                    }
                  }}
                  className="w-full py-2.5 bg-gray-950 hover:bg-gray-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Manually Adjust Details</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-xs text-gray-400 h-64 flex flex-col items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
              <span>Select an active or pending ad listing from the register table to examine media assets, metadata, and views telemetry.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
