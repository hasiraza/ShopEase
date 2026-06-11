/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Category, formatCurrency } from '../types';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'product_id'>) => void;
  onViewProductOnStorefront?: (productId: number) => void;
}

export default function ProductsView({ products, categories, onAddProduct, onViewProductOnStorefront }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
  });
  
  const [validationError, setValidationError] = useState('');

  // Handle filter matching
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const catId = parseInt(selectedCategory, 10);
      matchesCategory = p.category_id === catId;
    }

    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.category_id === catId);
    return cat ? cat.category_name : 'General';
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { text: 'Out of Stock', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200' };
    if (qty <= 25) return { text: 'Low Stock', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { text: 'In Stock', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].category_id.toString() : '',
      price: '',
      stock: '',
      description: '',
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validations
    if (!formData.name.trim()) {
      setValidationError('Product Name is required.');
      return;
    }
    if (!formData.categoryId) {
      setValidationError('Please select a Category.');
      return;
    }
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setValidationError('Price must be a valid number greater than 0.');
      return;
    }

    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setValidationError('Stock Quantity must be a valid non-negative integer.');
      return;
    }

    onAddProduct({
      product_name: formData.name.trim(),
      category_id: parseInt(formData.categoryId, 10),
      price: priceNum,
      stock_qty: stockNum,
      description: formData.description.trim() || 'No description provided.',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-6 rounded-2xl shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage your online inventory items, monitor stock statuses, and register new product listings.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#6c63ff] hover:bg-[#5b54e0] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>➕</span> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
            >
              &times;
            </button>
          )}
        </div>

        {/* Dropdown Category Filter */}
        <div className="w-full md:w-64 flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="products-table">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50">
                <th className="py-3.5 px-5 select-none w-20">ID</th>
                <th className="py-3.5 px-5 select-none">Product Name</th>
                <th className="py-3.5 px-5 select-none w-44">Category</th>
                <th className="py-3.5 px-5 select-none w-36">Price (PKR)</th>
                <th className="py-3.5 px-5 select-none w-24">Stock</th>
                <th className="py-3.5 px-5 select-none w-36 text-right">Status</th>
                <th className="py-3.5 px-5 select-none w-44 text-right">Storefront Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredProducts.map((p) => {
                const status = getStockStatus(p.stock_qty);
                return (
                  <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-400">PRD-{p.product_id}</td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{p.product_name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[260px] md:max-w-md lt-md:hidden mt-0.5">
                        {p.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">
                      {getCategoryName(p.category_id)}
                    </td>
                    <td className="py-3.5 px-5 font-bold font-mono text-slate-800">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3.5 px-5 font-medium font-mono">
                      {p.stock_qty}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${status.badgeClass}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold">
                      {onViewProductOnStorefront && (
                        <button
                          onClick={() => onViewProductOnStorefront(p.product_id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-[#6c63ff] text-[#6c63ff] hover:text-white border border-indigo-100/50 hover:border-[#6c63ff] transition-all text-[10px] font-bold cursor-pointer"
                        >
                          🔗 Store Link
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm font-semibold text-slate-500">No products found matching filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search parameter or category dropdown.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Register New Product</h3>
                <p className="text-indigo-200 text-xs mt-0.5">Add a new item to the active online marketplace collection.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold font-mono self-start cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2 font-semibold">
                  <span>❌</span> {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Realme Narzo 50"
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-hidden"
                    >
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Price (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5200"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-sm focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Initial Stock <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 150"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-sm focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter short outline of features or specs..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b54e0] text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
