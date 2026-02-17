import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

export interface ClickUpDestination {
	workspace_id: string;
	space_id: string;
	folder_id?: string | null;
	list_id: string;
}

interface ClickUpHierarchySelectorProps {
	apiToken?: string; // Optional - not needed since endpoints read from DB (kept for backward compatibility)
	workspaceId: string;
	value?: ClickUpDestination;
	onChange: (destination: ClickUpDestination | null) => void;
	disabled?: boolean;
}

export function ClickUpHierarchySelector({
	apiToken: _apiToken, // Not needed - endpoints read from DB
	workspaceId,
	value,
	onChange,
	disabled = false,
}: ClickUpHierarchySelectorProps) {
	const [workspaces, setWorkspaces] = useState<Array<{ workspace_id: string; name: string }>>([]);
	const [spaces, setSpaces] = useState<Array<{ space_id: string; name: string }>>([]);
	const [folders, setFolders] = useState<Array<{ folder_id: string; name: string }>>([]);
	const [lists, setLists] = useState<Array<{ list_id: string; name: string; is_sprint?: boolean }>>([]);
	
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaceId || '');
	const [selectedSpaceId, setSelectedSpaceId] = useState<string>(value?.space_id || '');
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(value?.folder_id || null);
	const [selectedListId, setSelectedListId] = useState<string>(value?.list_id || '');

	// Auto-select workspace if only one is available or if workspaceId is provided
	useEffect(() => {
		if (workspaces.length === 1 && !selectedWorkspaceId && !workspaceId) {
			setSelectedWorkspaceId(workspaces[0].workspace_id);
		} else if (workspaceId && !selectedWorkspaceId) {
			setSelectedWorkspaceId(workspaceId);
		} else if (workspaces.length > 0 && !selectedWorkspaceId && !workspaceId) {
			// If no workspaceId provided but we have workspaces, select first one
			setSelectedWorkspaceId(workspaces[0].workspace_id);
		}
	}, [workspaces, workspaceId, selectedWorkspaceId]);
	
	const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
	const [loadingSpaces, setLoadingSpaces] = useState(false);
	const [loadingFolders, setLoadingFolders] = useState(false);
	const [loadingLists, setLoadingLists] = useState(false);

	// Load workspaces on mount (workspaces are stored in DB, no API token needed)
	useEffect(() => {
		loadWorkspaces();
	}, []);

	// Load spaces when workspace is determined
	useEffect(() => {
		const effectiveWorkspaceId = selectedWorkspaceId || workspaceId;
		if (effectiveWorkspaceId) {
			loadSpaces(effectiveWorkspaceId);
		}
	}, [selectedWorkspaceId, workspaceId]);


	// Load folders when space changes
	useEffect(() => {
		if (selectedSpaceId) {
			loadFolders(selectedSpaceId);
			loadLists(selectedSpaceId, null); // Load folderless lists
		}
	}, [selectedSpaceId]);

	// Load lists when folder changes
	useEffect(() => {
		if (selectedSpaceId) {
			loadLists(selectedSpaceId, selectedFolderId);
		}
	}, [selectedSpaceId, selectedFolderId]);

	// Emit destination when all selections are made
	useEffect(() => {
		const effectiveWorkspaceId = selectedWorkspaceId || workspaceId;
		if (effectiveWorkspaceId && selectedSpaceId && selectedListId) {
			onChange({
				workspace_id: effectiveWorkspaceId,
				space_id: selectedSpaceId,
				folder_id: selectedFolderId,
				list_id: selectedListId,
			});
		} else {
			onChange(null);
		}
	}, [selectedWorkspaceId, workspaceId, selectedSpaceId, selectedFolderId, selectedListId]);

	const loadWorkspaces = async () => {
		setLoadingWorkspaces(true);
		try {
			// Use RTK Query hook would require component refactor, using direct API call for now
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/settings/clickup/workspaces`, {
				headers: {
					'X-API-Key': import.meta.env.VITE_API_KEY || '',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
				},
			});
			const data = await response.json();
			setWorkspaces(data.workspaces || []);
		} catch (error) {
			console.error('Error loading workspaces:', error);
		} finally {
			setLoadingWorkspaces(false);
		}
	};

	const loadSpaces = async (workspaceId: string) => {
		setLoadingSpaces(true);
		setSpaces([]);
		setFolders([]);
		setLists([]);
		setSelectedSpaceId('');
		setSelectedFolderId(null);
		setSelectedListId('');
		try {
			console.log(`[ClickUpHierarchySelector] Loading spaces for workspace: ${workspaceId}`);
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/settings/clickup/spaces/${workspaceId}`, {
				headers: {
					'X-API-Key': import.meta.env.VITE_API_KEY || '',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
				},
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				console.error(`[ClickUpHierarchySelector] Error response: ${response.status}`, errorData);
				throw new Error(errorData.error || `Failed to load spaces: ${response.status}`);
			}
			
			const data = await response.json();
			console.log(`[ClickUpHierarchySelector] Received ${data.spaces?.length || 0} space(s)`, data);
			setSpaces(data.spaces || []);
			
			if (!data.spaces || data.spaces.length === 0) {
				console.warn(`[ClickUpHierarchySelector] No spaces found for workspace ${workspaceId}. Please sync ClickUp data in Settings.`);
			}
		} catch (error) {
			console.error('[ClickUpHierarchySelector] Error loading spaces:', error);
		} finally {
			setLoadingSpaces(false);
		}
	};

	const loadFolders = async (spaceId: string) => {
		setLoadingFolders(true);
		setFolders([]);
		setLists([]);
		setSelectedFolderId(null);
		setSelectedListId('');
		try {
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/settings/clickup/folders/${spaceId}`, {
				headers: {
					'X-API-Key': import.meta.env.VITE_API_KEY || '',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
				},
			});
			const data = await response.json();
			setFolders(data.folders || []);
		} catch (error) {
			console.error('Error loading folders:', error);
		} finally {
			setLoadingFolders(false);
		}
	};

	const loadLists = async (spaceId: string, folderId: string | null | undefined) => {
		setLoadingLists(true);
		setLists([]);
		setSelectedListId('');
		try {
			const params = new URLSearchParams();
			if (folderId !== null && folderId !== undefined) {
				params.append('folderId', folderId);
			}
			const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/settings/clickup/lists/${spaceId}${params.toString() ? '?' + params.toString() : ''}`;
			const response = await fetch(url, {
				headers: {
					'X-API-Key': import.meta.env.VITE_API_KEY || '',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
				},
			});
			const data = await response.json();
			setLists(data.lists || []);
		} catch (error) {
			console.error('Error loading lists:', error);
		} finally {
			setLoadingLists(false);
		}
	};

	const handleWorkspaceChange = (workspaceId: string) => {
		setSelectedWorkspaceId(workspaceId);
	};

	const handleSpaceChange = (spaceId: string) => {
		setSelectedSpaceId(spaceId);
	};

	const handleFolderChange = (folderId: string | 'none') => {
		setSelectedFolderId(folderId === 'none' ? null : folderId);
	};

	const handleListChange = (listId: string) => {
		setSelectedListId(listId);
	};

	const selectedList = lists.find(l => l.list_id === selectedListId);
	const isSprint = selectedList?.is_sprint || false;

	return (
		<div className="space-y-4">
			{workspaces.length > 1 && (
				<div className="space-y-2">
					<Label htmlFor="workspace">Workspace</Label>
					<Select
						value={selectedWorkspaceId}
						onValueChange={handleWorkspaceChange}
						disabled={disabled || loadingWorkspaces}
					>
						<SelectTrigger id="workspace">
							<SelectValue placeholder={loadingWorkspaces ? 'Loading...' : 'Select workspace'} />
						</SelectTrigger>
						<SelectContent>
							{workspaces.map((workspace) => (
								<SelectItem key={workspace.workspace_id} value={workspace.workspace_id}>
									{workspace.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			{workspaces.length === 1 && !workspaceId && (
				<div className="text-sm text-muted-foreground p-2 border rounded bg-muted/50">
					Workspace: {workspaces[0].name}
				</div>
			)}
			{workspaces.length === 0 && !loadingWorkspaces && (
				<div className="text-sm text-muted-foreground p-2 border rounded bg-muted/50">
					No workspaces found. Please sync ClickUp data in Settings.
				</div>
			)}
			{loadingWorkspaces && (
				<div className="text-sm text-muted-foreground p-2 border rounded bg-muted/50">
					Loading workspaces...
				</div>
			)}

			{(selectedWorkspaceId || workspaceId) && (
				<div className="space-y-2">
					<Label htmlFor="space">Space</Label>
					{loadingSpaces ? (
						<div className="text-sm text-muted-foreground p-2 border rounded bg-muted/50">
							Loading spaces...
						</div>
					) : spaces.length === 0 ? (
						<div className="text-sm text-muted-foreground p-3 border rounded bg-muted/50">
							<p className="font-medium mb-1">No spaces found</p>
							<p className="text-xs">Please go to Settings and click "Save API Token & Sync" to sync your ClickUp hierarchy.</p>
						</div>
					) : (
						<Select
							value={selectedSpaceId}
							onValueChange={handleSpaceChange}
							disabled={disabled}
						>
							<SelectTrigger id="space">
								<SelectValue placeholder="Select space" />
							</SelectTrigger>
							<SelectContent>
								{spaces.map((space) => (
									<SelectItem key={space.space_id} value={space.space_id}>
										{space.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			)}

			{(selectedWorkspaceId || workspaceId) && selectedSpaceId && (
				<div className="space-y-2">
					<Label htmlFor="folder">Folder (Optional)</Label>
					<Select
						value={selectedFolderId || 'none'}
						onValueChange={handleFolderChange}
						disabled={disabled || loadingFolders}
					>
						<SelectTrigger id="folder">
							<SelectValue placeholder={loadingFolders ? 'Loading...' : 'Select folder (or none for folderless)'} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None (Folderless)</SelectItem>
							{folders.map((folder) => (
								<SelectItem key={folder.folder_id} value={folder.folder_id}>
									{folder.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{loadingFolders && (
						<p className="text-xs text-muted-foreground mt-1">Loading folders...</p>
					)}
				</div>
			)}

			{(selectedWorkspaceId || workspaceId) && selectedSpaceId && (
				<div className="space-y-2">
					<Label htmlFor="list">List</Label>
					<Select
						value={selectedListId}
						onValueChange={handleListChange}
						disabled={disabled || loadingLists}
					>
						<SelectTrigger id="list">
							<SelectValue placeholder={loadingLists ? 'Loading...' : 'Select list'} />
						</SelectTrigger>
						<SelectContent>
							{lists.length === 0 && !loadingLists ? (
								<SelectItem value="no-lists" disabled>
									No lists found
								</SelectItem>
							) : (
								lists.map((list) => (
									<SelectItem key={list.list_id} value={list.list_id}>
										{list.name} {list.is_sprint ? '(Sprint)' : ''}
									</SelectItem>
								))
							)}
						</SelectContent>
					</Select>
					{loadingLists && (
						<p className="text-xs text-muted-foreground mt-1">Loading lists...</p>
					)}
					{isSprint && (
						<p className="text-sm text-muted-foreground mt-1">
							ℹ️ Tasks will be created in the latest active sprint
						</p>
					)}
				</div>
			)}
		</div>
	);
}
