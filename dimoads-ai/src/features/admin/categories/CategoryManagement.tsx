/**
 * Category Management Subsystem View
 */
import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Check, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Sparkles,
  RefreshCw,
  Tag
} from 'lucide-react';
import { AdminCategory } from '../types';
import { AdminService } from '../services/adminService';

interface CategoryManagementProps {
  language: 'en' | 'ar';
}

export default function CategoryManagement({ language }: CategoryManagementProps) {
  const [categories, setCategories] = useState<AdminCategory[]>(() => AdminService.getCategories());
  
  // New Category States
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [icon, setIcon] = useState('✨');
  const [sortOrder, setSortOrder] = useState(1);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr || !slug) {
      alert('Please fill out all required fields');
      return;
    }

    const payload: Omit<AdminCategory, 'id'> = {
      nameEn,
      nameAr,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      parentId: parentId ? parentId : null,
      icon,
      imageUrl: '',
      sortOrder: Number(sortOrder),
      status: 'enabled'
    };

    const added = AdminService.addCategory(payload);
    setCategories(AdminService.getCategories());

    // Reset Form
    setNameEn('');
    setNameAr('');
    setSlug('');
    setParentId('');
    setIcon('✨');
    setSortOrder(1);
  };

  const handleToggleStatus = (id: string) => {
    const list = [...categories];
    const cat = list.find(c => c.id === id);
    if (cat) {
      cat.status = cat.status === 'enabled' ? 'disabled' : 'enabled';
      AdminService.updateCategory(cat);
      setCategories(AdminService.getCategories());
    }
  };

  // Helper to get nested indentation
  const getParentName = (pId: string | null) => {
    if (!pId) return 'Root / Top';
    const found = categories.find(c => c.id === pId);
    return found ? `${found.nameEn} (${found.nameAr})` : 'Root';
  };

  // Organize categories into roots and children for beautiful tree representation
  const rootCategories = categories.filter(c => c.parentId === null);
  const getChildrenOf = (parentCatId: string) => categories.filter(c => c.parentId === parentCatId);

  return (
    <div id="admin_category_manager" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Create New Taxonomy */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2 mb-2">
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>Create Smart Category Node</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            {/* English Title */}
            <div>
              <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                Category Title (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Electric SUVs"
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Arabic Title */}
            <div className="text-right" dir="rtl">
              <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1 text-left" dir="ltr">
                Category Title (Arabic) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: سيارات كهربائية"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold text-right"
              />
            </div>

            {/* SEO Slug */}
            <div>
              <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                SEO URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="electric-suvs"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-[10px]"
              />
            </div>

            {/* Nested Category - Parent Selector */}
            <div>
              <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                Parent Node (Unlimited Nesting)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold text-gray-600"
              >
                <option value="">-- [Root Level Category] --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? '  ↳ ' : ''}{c.nameEn} ({c.nameAr})
                  </option>
                ))}
              </select>
            </div>

            {/* Icon Picker & Sort Order */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                  Glyph Icon
                </label>
                <input
                  type="text"
                  placeholder="🚗"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-center text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                  Sort Rank
                </label>
                <input
                  type="number"
                  placeholder="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              Add Category Node
            </button>
          </form>
        </div>

        {/* Right Panel: Nested Category Tree View */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Taxonomy Hierarchical Tree</span>
            </h3>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              Middle East Localized Engine
            </span>
          </div>

          <div className="space-y-4">
            {rootCategories.map((root) => {
              const children = getChildrenOf(root.id);
              return (
                <div key={root.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3">
                  {/* Root Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{root.icon}</span>
                      <div>
                        <span className="font-extrabold text-gray-950 text-xs">
                          {root.nameEn} <span className="text-gray-400">/ {root.nameAr}</span>
                        </span>
                        <div className="text-[9px] text-gray-400 font-mono font-semibold">
                          /{root.slug} • Rank: {root.sortOrder}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        root.status === 'enabled' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {root.status}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(root.id)}
                        className="px-2 py-1 bg-white hover:bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>

                  {/* Children / Sub-categories row */}
                  {children.length > 0 && (
                    <div className="pl-6 border-l border-indigo-100 space-y-2.5">
                      {children.map((child) => (
                        <div key={child.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-sm">{child.icon}</span>
                            <div>
                              <span className="font-semibold text-gray-800">
                                {child.nameEn} <span className="text-gray-400">/ {child.nameAr}</span>
                              </span>
                              <span className="ml-2 font-mono text-[9px] text-gray-400 font-semibold">/{child.slug}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              child.status === 'enabled' ? 'bg-emerald-500/10 text-emerald-800' : 'bg-red-500/10 text-red-800'
                            }`}>
                              {child.status}
                            </span>
                            <button
                              onClick={() => handleToggleStatus(child.id)}
                              className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-600 text-[9px] font-bold rounded-md border border-gray-200 transition-colors cursor-pointer"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
