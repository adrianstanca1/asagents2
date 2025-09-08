import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Document as Doc, Project, Role, DocumentCategory, DocumentStatus } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { DocumentStatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';

interface DocumentsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const SortIcon: React.FC<{ sortKey: string; currentSort: { key: string; order: string; } }> = ({ sortKey, currentSort }) => {
    if (currentSort.key !== sortKey) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    }
    if (currentSort.order === 'asc') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ user, addToast }) => {
    const [allDocuments, setAllDocuments] = useState<Doc[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        projectId: 'all',
        category: 'all',
        status: 'all',
    });
    const [sort, setSort] = useState({ key: 'uploadedAt', order: 'desc' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let docsPromise;
            let projectsPromise;
            
            const userRole = user.role;
            if (userRole === Role.ADMIN) {
                projectsPromise = api.getProjectsByCompany(user.companyId);
                docsPromise = api.getDocumentsByCompany(user.companyId);
            } else if (userRole === Role.PM) {
                const managedProjects = await api.getProjectsByManager(user.id);
                const projectIds = managedProjects.map(p => p.id);
                docsPromise = api.getDocumentsByProjectIds(projectIds);
                projectsPromise = Promise.resolve(managedProjects);
            } else { // Operative, Foreman, Safety Officer
                const assignedProjects = await api.getProjectsByUser(user.id);
                const projectIds = assignedProjects.map(p => p.id);
                docsPromise = api.getDocumentsByProjectIds(projectIds);
                projectsPromise = Promise.resolve(assignedProjects);
            }
            
            const [docs, projs, companyUsers] = await Promise.all([
                docsPromise,
                projectsPromise,
                api.getUsersByCompany(user.companyId)
            ]);
            
            setAllDocuments(docs);
            setProjects(projs);
            setUsers(companyUsers);
        } catch (error) {
            addToast('Failed to load documents.', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = [...allDocuments];
        
        if (searchTerm) {
            filtered = filtered.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filters.projectId !== 'all') {
            filtered = filtered.filter(doc => doc.projectId === parseInt(filters.projectId, 10));
        }
        if (filters.category !== 'all') {
            filtered = filtered.filter(doc => doc.category === filters.category);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(doc => doc.status === filters.status);
        }
        
        filtered.sort((a, b) => {
            let valA, valB;
            if (sort.key === 'uploadedAt') {
                valA = new Date(a.uploadedAt).getTime();
                valB = new Date(b.uploadedAt).getTime();
            } else { // name
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            }

            if (valA < valB) return sort.order === 'asc' ? -1 : 1;
            if (valA > valB) return sort.order === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [allDocuments, searchTerm, filters, sort]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const handleSort = (key: 'name' | 'uploadedAt') => {
        setSort(prev => {
            if (prev.key === key) {
                return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' };
            }
            return { key, order: 'desc' };
        });
    }
    
    if (loading) {
        return <Card><p>Loading documents...</p></Card>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Documents</h2>
            <Card>
                <div className="flex flex-wrap items-end gap-4 mb-4 pb-4 border-b">
                    <div className="flex-grow min-w-[250px]">
                        <label htmlFor="doc-search" className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
                        <input
                            id="doc-search"
                            type="text"
                            placeholder="e.g., Safety Manual..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                     <div className="flex-shrink-0">
                        <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select id="project-filter" name="projectId" value={filters.projectId} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                            <option value="all">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div className="flex-shrink-0">
                        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="category-filter" name="category" value={filters.category} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                            <option value="all">All Categories</option>
                            {Object.values(DocumentCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div className="flex-shrink-0">
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                            <option value="all">All Statuses</option>
                            {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <button onClick={() => handleSort('name')} className={`flex items-center gap-1 transition-colors ${sort.key === 'name' ? 'text-slate-800 font-semibold' : 'hover:text-slate-700'}`}>
                                        Document Name <SortIcon sortKey="name" currentSort={sort} />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                     <button onClick={() => handleSort('uploadedAt')} className={`flex items-center gap-1 transition-colors ${sort.key === 'uploadedAt' ? 'text-slate-800 font-semibold' : 'hover:text-slate-700'}`}>
                                        Uploaded <SortIcon sortKey="uploadedAt" currentSort={sort} />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Uploaded By</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedDocuments.map(doc => {
                                const project = projects.find(p => p.id === doc.projectId);
                                const creator = users.find(u => u.id === doc.creatorId);
                                return (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{doc.name} (v{doc.version})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{project?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><DocumentStatusBadge status={doc.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{creator?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {doc.status === DocumentStatus.APPROVED && (
                                            <Button size="sm" variant="secondary" onClick={() => window.open(doc.url, '_blank')}>
                                                Preview
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {filteredAndSortedDocuments.length === 0 && (
                        <p className="text-center py-8 text-slate-500">No documents match the current filters.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};