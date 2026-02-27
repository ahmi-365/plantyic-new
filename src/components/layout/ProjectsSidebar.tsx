'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, MoreHorizontal, Folder, FolderOpen, Star, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useActiveProject } from '@/contexts/ActiveProjectContext';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  color: string;
  isFavorite: boolean;
  taskCount: number;
}

interface ProjectsSidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
}

export default function ProjectsSidebar({ isOpen, onToggle }: ProjectsSidebarProps) {
  const { activeProjectId, setActiveProject } = useActiveProject();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Plantyic App',
      color: 'bg-blue-500',
      isFavorite: true,
      taskCount: 12,
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      color: 'bg-purple-500',
      isFavorite: true,
      taskCount: 8,
    },
    {
      id: '3',
      name: 'Website Redesign',
      color: 'bg-green-500',
      isFavorite: false,
      taskCount: 15,
    },
    {
      id: '4',
      name: 'Mobile App',
      color: 'bg-orange-500',
      isFavorite: false,
      taskCount: 10,
    },
  ]);

  const [expandedProjects, setExpandedProjects] = useState<string[]>(['1']);
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  useEffect(() => {
    setIsCollapsed(!isOpen);
  }, [isOpen]);

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleFavorite = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const favoriteProjects = projects.filter((p) => p.isFavorite);
  const otherProjects = projects.filter((p) => !p.isFavorite);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <h2 className="font-semibold text-sm text-sidebar-foreground">Projects</h2>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isCollapsed && '-rotate-90')}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Add New Project */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Favorite Projects */}
        {favoriteProjects.length > 0 && !isCollapsed && (
          <div className="px-2 py-3">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider"
            >
              Favorites
            </motion.h3>
            <div className="space-y-1">
              {favoriteProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectItem
                    project={project}
                    isActive={activeProjectId === project.id}
                    onSelect={() => setActiveProject(project.id, project.name)}
                    onToggleFavorite={() => toggleFavorite(project.id)}
                    onDelete={() => deleteProject(project.id)}
                    isCollapsed={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && !isCollapsed && (
          <div className="px-2 py-3">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider"
            >
              Projects
            </motion.h3>
            <div className="space-y-1">
              {otherProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectItem
                    project={project}
                    isActive={activeProjectId === project.id}
                    onSelect={() => setActiveProject(project.id, project.name)}
                    onToggleFavorite={() => toggleFavorite(project.id)}
                    onDelete={() => deleteProject(project.id)}
                    isCollapsed={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed View - Project Icons */}
        {isCollapsed && (
          <div className="py-2 space-y-2 flex flex-col items-center">
            {projects.map((project) => (
              <motion.button
                key={project.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveProject(project.id, project.name)}
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-all',
                  activeProjectId === project.id
                    ? `${project.color} text-white shadow-lg`
                    : `${project.color} text-white opacity-60 hover:opacity-100`
                )}
                title={project.name}
              >
                {project.name.charAt(0).toUpperCase()}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-lg flex items-center justify-center bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-primary transition-colors"
              title="New Project"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isCollapsed: boolean;
}

function ProjectItem({
  project,
  isActive,
  onSelect,
  onToggleFavorite,
  onDelete,
  isCollapsed,
}: ProjectItemProps) {
  if (isCollapsed) return null;

  return (
    <motion.div
      className={cn(
        'relative group rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-accent text-sidebar-foreground'
      )}
      onClick={onSelect}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={cn('h-3 w-3 rounded-full flex-shrink-0', project.color)}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{project.name}</p>
            <p className={cn('text-xs', isActive ? 'opacity-80' : 'opacity-60')}>
              {project.taskCount} tasks
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
                isActive && 'opacity-100'
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}>
              <Star className="h-4 w-4 mr-2" />
              {project.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
            }}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
