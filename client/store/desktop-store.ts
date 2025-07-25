import { create } from 'zustand'

export interface DesktopIcon {
  id: string
  appId: string
  name: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
  position: { x: number; y: number }
  size: { width: number; height: number }
  defaultSize: { width: number; height: number }
  defaultPosition: { x: number; y: number }
  description: string
  isInFolder?: boolean
  folderId?: string
}

export interface DesktopFolder {
  id: string
  name: string
  position: { x: number; y: number }
  iconIds: string[]
  isOpen: boolean
}

interface DesktopStore {
  icons: DesktopIcon[]
  folders: DesktopFolder[]
  isEditMode: boolean
  selectedIcons: string[]
  draggedIcon: string | null
  
  setEditMode: (editMode: boolean) => void
  addIcon: (icon: Omit<DesktopIcon, 'id'>) => string
  removeIcon: (id: string) => void
  duplicateIcon: (id: string) => string
  updateIconPosition: (id: string, position: { x: number; y: number }) => void
  updateIconSize: (id: string, size: { width: number; height: number }) => void
  updateIconColor: (id: string, color: string) => void
  updateIconName: (id: string, name: string) => void
  selectIcon: (id: string, multiSelect?: boolean) => void
  clearSelection: () => void
  setDraggedIcon: (id: string | null) => void
  
  createFolder: (iconIds: string[], position: { x: number; y: number }, name?: string) => string
  addToFolder: (iconId: string, folderId: string) => void
  removeFromFolder: (iconId: string) => void
  updateFolderPosition: (id: string, position: { x: number; y: number }) => void
  toggleFolder: (id: string) => void
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  
  getIcon: (id: string) => DesktopIcon | undefined
  getFolder: (id: string) => DesktopFolder | undefined
  getIconsInFolder: (folderId: string) => DesktopIcon[]
  getFreeIcons: () => DesktopIcon[]
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  icons: [],
  folders: [],
  isEditMode: false,
  selectedIcons: [],
  draggedIcon: null,
  
  setEditMode: (editMode) => {
    set({ isEditMode: editMode })
    if (!editMode) {
      set({ selectedIcons: [] })
    }
  },
  
  addIcon: (iconData) => {
    const id = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const icon: DesktopIcon = {
      ...iconData,
      id,
      size: iconData.size || { width: 64, height: 64 },
    }
    
    set((state) => ({
      icons: [...state.icons, icon],
    }))
    
    return id
  },
  
  removeIcon: (id) => {
    set((state) => ({
      icons: state.icons.filter((icon) => icon.id !== id),
      selectedIcons: state.selectedIcons.filter((iconId) => iconId !== id),
    }))
  },
  
  duplicateIcon: (id) => {
    const originalIcon = get().getIcon(id)
    if (!originalIcon) return ''
    
    const newId = get().addIcon({
      ...originalIcon,
      position: {
        x: originalIcon.position.x + 80,
        y: originalIcon.position.y + 80,
      },
      name: `${originalIcon.name} Copy`,
    })
    
    return newId
  },
  
  updateIconPosition: (id, position) => {
    set((state) => ({
      icons: state.icons.map((icon) =>
        icon.id === id ? { ...icon, position } : icon
      ),
    }))
  },
  
  updateIconSize: (id, size) => {
    set((state) => ({
      icons: state.icons.map((icon) =>
        icon.id === id ? { ...icon, size } : icon
      ),
    }))
  },
  
  selectIcon: (id, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedIcons.includes(id)
        return {
          selectedIcons: isSelected
            ? state.selectedIcons.filter((iconId) => iconId !== id)
            : [...state.selectedIcons, id],
        }
      } else {
        return { selectedIcons: [id] }
      }
    })
  },
  
  clearSelection: () => {
    set({ selectedIcons: [] })
  },
  
  setDraggedIcon: (id) => {
    set({ draggedIcon: id })
  },
  
  createFolder: (iconIds, position, name = 'New Folder') => {
    const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const folder: DesktopFolder = {
      id: folderId,
      name,
      position,
      iconIds,
      isOpen: false,
    }
    
    set((state) => ({
      folders: [...state.folders, folder],
      icons: state.icons.map((icon) =>
        iconIds.includes(icon.id)
          ? { ...icon, isInFolder: true, folderId }
          : icon
      ),
    }))
    
    return folderId
  },
  
  addToFolder: (iconId, folderId) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === folderId
          ? { ...folder, iconIds: [...folder.iconIds, iconId] }
          : folder
      ),
      icons: state.icons.map((icon) =>
        icon.id === iconId ? { ...icon, isInFolder: true, folderId } : icon
      ),
    }))
  },
  
  removeFromFolder: (iconId) => {
    const icon = get().getIcon(iconId)
    if (!icon?.folderId) return
    
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === icon.folderId
          ? { ...folder, iconIds: folder.iconIds.filter((id) => id !== iconId) }
          : folder
      ),
      icons: state.icons.map((ico) =>
        ico.id === iconId
          ? { ...ico, isInFolder: false, folderId: undefined }
          : ico
      ),
    }))
  },
  
  updateFolderPosition: (id, position) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, position } : folder
      ),
    }))
  },
  
  toggleFolder: (id) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, isOpen: !folder.isOpen } : folder
      ),
    }))
  },
  
  renameFolder: (id, name) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, name } : folder
      ),
    }))
  },
  
  deleteFolder: (id) => {
    const folder = get().getFolder(id)
    if (!folder) return
    
    // Remove all icons from folder
    folder.iconIds.forEach((iconId) => {
      get().removeFromFolder(iconId)
    })
    
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    }))
  },
  
  getIcon: (id) => {
    return get().icons.find((icon) => icon.id === id)
  },
  
  getFolder: (id) => {
    return get().folders.find((folder) => folder.id === id)
  },
  
  getIconsInFolder: (folderId) => {
    return get().icons.filter((icon) => icon.folderId === folderId)
  },
  
  getFreeIcons: () => {
    return get().icons.filter((icon) => !icon.isInFolder)
  },
}))
