import { ReactNode, useState, useEffect } from "react";

import { motion } from "framer-motion";

import TopNavbar from "./TopNavbar";

import ProjectsSidebar from "./ProjectsSidebar";

import BottomToolbar from "./BottomToolbar";

import { PinnedTasksSidebar, usePinnedTasks, TaskDetailPanel, PinnedTask } from "@/components/TaskPinnedPanel";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button";

import { format } from "date-fns";

import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";

import GlobalContextMenu from "@/components/GlobalContextMenu";

import AIChatWidget from "@/components/AIChatWidget";

import { useTheme } from "@/contexts/ThemeContext";

import { useActiveProject } from "@/contexts/ActiveProjectContext";

import {

  Flag, CalendarDays, Clock, Tag, User, Bell, Users, FileText,

  ListChecks, Paperclip, X, Plus, RotateCcw

} from "lucide-react";



interface AppLayoutProps {

  children: ReactNode;

  title: string;

  onAddTask?: () => void;

}



// Read sidebar state from localStorage - this key is used globally

function getSidebarState(): boolean {

  try {

    return JSON.parse(localStorage.getItem("plantyic_projects_sidebar") || "false");

  } catch {

    return false;

  }

}



function setSidebarState(val: boolean) {

  localStorage.setItem("plantyic_projects_sidebar", JSON.stringify(val));

}



export default function AppLayout({ children, title, onAddTask }: AppLayoutProps) {

  const [projectsSidebar, setProjectsSidebar] = useState(getSidebarState);

  const { pinnedTasks, pinTask, unpinTask, isPinned } = usePinnedTasks();

  const [selectedTask, setSelectedTask] = useState<PinnedTask | null>(null);

  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  const isMobile = useIsMobile();

  const { settings } = useTheme();

  const { activeProjectId, activeProjectName } = useActiveProject();



  // Sync sidebar state to localStorage

  useEffect(() => {

    setSidebarState(projectsSidebar);

  }, [projectsSidebar]);



  // Global Add Task sheet

  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const [newTask, setNewTask] = useState({

    title: "",

    description: "",

    priority: "medium" as "low" | "medium" | "high" | "urgent",

    status: "todo" as string,

    type: "task" as string,

    project: activeProjectId || "" as string,

    assignee: "You" as string,

    estimatedTime: "30" as string,

    startDate: undefined as Date | undefined,

    dueDate: undefined as Date | undefined,

    recurring: "none" as string,

    tags: [] as string[],

    notifications: true,

    watchers: ["You"] as string[],

    subtasks: [] as string[],

    notes: "",

  });

  const [newTagInput, setNewTagInput] = useState("");

  const [newSubtaskInput, setNewSubtaskInput] = useState("");



  const openTask = (task: PinnedTask) => {

    setSelectedTask(task);

    setTaskPanelOpen(true);

  };



  const handlePinAndOpen = (task: PinnedTask) => {

    pinTask(task);

    openTask(task);

  };



  const handleAddTask = () => {

    if (onAddTask) {

      onAddTask();

    } else if (!activeProjectId) {

      // No project selected — open projects sidebar and show a toast

      setProjectsSidebar(true);

      toast.info("Please select a project first", {

        description: "Click a project in the sidebar to get started",

      });

    } else {

      // Pre-populate project

      setNewTask(prev => ({ ...prev, project: activeProjectId }));

      setAddTaskOpen(true);

    }

  };



  const resetNewTask = () => {

    setNewTask({

      title: "", description: "", priority: "medium", status: "todo", type: "task",

      project: "", assignee: "You", estimatedTime: "30", startDate: undefined,

      dueDate: undefined, recurring: "none", tags: [], notifications: true,

      watchers: ["You"], subtasks: [], notes: "",

    });

    setNewTagInput("");

    setNewSubtaskInput("");

  };



  const handleCreateTask = () => {

    if (!newTask.title.trim()) return;

    if (!newTask.project) {

      toast.error("Please select a project", { description: "A project is required to create a task" });

      return;

    }

    const task: PinnedTask = {

      id: Date.now().toString(),

      title: newTask.title.trim(),

      priority: newTask.priority,

      status: newTask.status,

      tags: newTask.tags,

      assignedTo: newTask.assignee,

      assignedBy: "JD",

      description: newTask.description || newTask.notes,

    };

    pinTask(task);

    openTask(task);

    setAddTaskOpen(false);

    resetNewTask();

    toast.success("Task created and pinned!", { description: task.title });

  };



  const addTag = () => {

    if (newTagInput.trim() && !newTask.tags.includes(newTagInput.trim())) {

      setNewTask(prev => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));

      setNewTagInput("");

    }

  };



  const addSubtask = () => {

    if (newSubtaskInput.trim()) {

      setNewTask(prev => ({ ...prev, subtasks: [...prev.subtasks, newSubtaskInput.trim()] }));

      setNewSubtaskInput("");

    }

  };



  const sidebarOnRight = settings.sidebarOnRight;

  const marginLeft = !isMobile && projectsSidebar && !sidebarOnRight ? "ml-64" : "";

  const marginRight = !isMobile && projectsSidebar && sidebarOnRight ? "mr-64" : "";

  const [pinnedSidebarOpen, setPinnedSidebarOpen] = useState(false);

  const pinnedMarginRight = !isMobile && pinnedSidebarOpen && pinnedTasks.length > 0 ? "mr-56" : "";



  const [aiOpen, setAiOpen] = useState(false);



  return (

    <GlobalContextMenu onAddTask={handleAddTask} onOpenAI={() => setAiOpen(true)}>

      <div className="flex flex-col min-h-screen bg-background">

        <TopNavbar

          onAddTask={handleAddTask}

          onToggleProjectsSidebar={() => setProjectsSidebar(p => !p)}

          projectsSidebarOpen={projectsSidebar}

        />

        <ProjectsSidebar

          open={projectsSidebar}

          onClose={() => setProjectsSidebar(false)}

          onOpenTask={handlePinAndOpen}

          side={sidebarOnRight ? "right" : "left"}

        />

        <motion.main

          initial={{ opacity: 0, y: 8 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.3, ease: "easeOut" }}

          className={`flex-1 overflow-y-auto p-4 sm:p-6 pb-24 transition-all ${marginLeft} ${sidebarOnRight ? pinnedMarginRight : marginRight} ${!sidebarOnRight ? pinnedMarginRight : ""}`}

        >

          {children}

        </motion.main>

        <BottomToolbar activeProjectId={activeProjectId} />

        <PinnedTasksSidebar pinnedTasks={pinnedTasks} onOpenTask={openTask} onUnpin={unpinTask} isOpen={pinnedSidebarOpen} onToggle={() => setPinnedSidebarOpen(p => !p)} />

        <TaskDetailPanel

          task={selectedTask}

          open={taskPanelOpen}

          onOpenChange={setTaskPanelOpen}

          isPinned={selectedTask ? isPinned(selectedTask.id) : false}

          onPin={pinTask}

          onUnpin={unpinTask}

        />



        {/* Enhanced Global Add Task Sheet */}

        <Sheet open={addTaskOpen} onOpenChange={setAddTaskOpen}>

          <SheetContent side="right" className="w-full sm:w-[480px] p-0 overflow-y-auto">

            <div className="p-5">

              <SheetHeader className="mb-5">

                <SheetTitle className="font-display text-lg">Create New Task</SheetTitle>

              </SheetHeader>

              <div className="space-y-4">

                {/* Title */}

                <input

                  value={newTask.title}

                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}

                  placeholder="Task title..."

                  className="w-full text-lg font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground"

                  autoFocus

                  onKeyDown={e => e.key === "Enter" && e.shiftKey && handleCreateTask()}

                />



                {/* Description */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Description</label>

                  <textarea

                    value={newTask.description}

                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}

                    placeholder="Add a description..."

                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[60px]"

                  />

                </div>



                {/* Project & Type */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">

                      Project <span className="text-destructive">*</span>

                    </label>

                    <Select value={newTask.project} onValueChange={v => setNewTask(prev => ({ ...prev, project: v }))}>

                      <SelectTrigger className={`h-9 text-xs ${!newTask.project ? "border-destructive/50 ring-1 ring-destructive/30" : ""}`}><SelectValue placeholder="Select project…" /></SelectTrigger>

                      <SelectContent>

                        {activeProjectId && activeProjectName && (

                          <SelectItem value={activeProjectId}>{activeProjectName}</SelectItem>

                        )}

                        <SelectItem value="onboarding">Onboarding Checklist</SelectItem>

                        <SelectItem value="website">Website Redesign</SelectItem>

                        <SelectItem value="mobile">Mobile App MVP</SelectItem>

                        <SelectItem value="social">Social Media Campaign</SelectItem>

                      </SelectContent>

                    </Select>

                    {!newTask.project && <p className="text-[10px] text-destructive mt-0.5">Required</p>}

                  </div>

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Type</label>

                    <Select value={newTask.type} onValueChange={v => setNewTask(prev => ({ ...prev, type: v }))}>

                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>

                      <SelectContent>

                        <SelectItem value="task">Task</SelectItem>

                        <SelectItem value="feature">Feature</SelectItem>

                        <SelectItem value="bug">Bug</SelectItem>

                        <SelectItem value="strategic">Strategic</SelectItem>

                        <SelectItem value="milestone">Milestone</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>



                {/* Status & Priority */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>

                    <Select value={newTask.status} onValueChange={v => setNewTask(prev => ({ ...prev, status: v }))}>

                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>

                      <SelectContent>

                        <SelectItem value="todo">To Do</SelectItem>

                        <SelectItem value="in-progress">In Progress</SelectItem>

                        <SelectItem value="review">In Review</SelectItem>

                        <SelectItem value="done">Done</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Flag className="w-3 h-3" /> Priority</label>

                    <div className="flex gap-1.5">

                      {(["low", "medium", "high", "urgent"] as const).map(p => (

                        <button

                          key={p}

                          onClick={() => setNewTask(prev => ({ ...prev, priority: p }))}

                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border capitalize transition-all ${

                            newTask.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"

                          }`}

                        >

                          {p}

                        </button>

                      ))}

                    </div>

                  </div>

                </div>



                {/* Assignee & Estimated Time */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><User className="w-3 h-3" /> Assignee</label>

                    <Select value={newTask.assignee} onValueChange={v => setNewTask(prev => ({ ...prev, assignee: v }))}>

                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>

                      <SelectContent>

                        <SelectItem value="You">You</SelectItem>

                        <SelectItem value="Alice Kim">Alice Kim</SelectItem>

                        <SelectItem value="John Doe">John Doe</SelectItem>

                        <SelectItem value="Sam Miller">Sam Miller</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Estimated time</label>

                    <div className="flex gap-1">

                      <input

                        type="number"

                        value={newTask.estimatedTime}

                        onChange={e => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}

                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"

                        placeholder="30"

                      />

                      <span className="text-xs text-muted-foreground self-center">min</span>

                    </div>

                  </div>

                </div>



                {/* Timeline */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Start date</label>

                    <Popover>

                      <PopoverTrigger asChild>

                        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9 font-normal">

                          {newTask.startDate ? format(newTask.startDate, "MMM dd, yyyy") : "Pick date"}

                        </Button>

                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">

                        <Calendar mode="single" selected={newTask.startDate} onSelect={d => setNewTask(prev => ({ ...prev, startDate: d }))} initialFocus />

                      </PopoverContent>

                    </Popover>

                  </div>

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Due date</label>

                    <Popover>

                      <PopoverTrigger asChild>

                        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9 font-normal">

                          {newTask.dueDate ? format(newTask.dueDate, "MMM dd, yyyy") : "No due date"}

                        </Button>

                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">

                        <Calendar mode="single" selected={newTask.dueDate} onSelect={d => setNewTask(prev => ({ ...prev, dueDate: d }))} initialFocus />

                      </PopoverContent>

                    </Popover>

                  </div>

                </div>



                {/* Recurring */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Recurring</label>

                  <div className="flex gap-1.5">

                    {["none", "daily", "weekly", "monthly"].map(r => (

                      <button

                        key={r}

                        onClick={() => setNewTask(prev => ({ ...prev, recurring: r }))}

                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border capitalize transition-all ${

                          newTask.recurring === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"

                        }`}

                      >

                        {r === "none" ? "None" : r}

                      </button>

                    ))}

                  </div>

                </div>



                {/* Tags */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</label>

                  <div className="flex flex-wrap gap-1 mb-1.5">

                    {newTask.tags.map(tag => (

                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">

                        {tag}

                        <button onClick={() => setNewTask(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>

                      </span>

                    ))}

                  </div>

                  <input

                    value={newTagInput}

                    onChange={e => setNewTagInput(e.target.value)}

                    onKeyDown={e => e.key === "Enter" && addTag()}

                    placeholder="+ Add tag"

                    className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"

                  />

                </div>



                {/* Subtasks */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><ListChecks className="w-3 h-3" /> Subtasks</label>

                  <div className="space-y-1 mb-1.5">

                    {newTask.subtasks.map((st, i) => (

                      <div key={i} className="flex items-center gap-2 text-xs text-foreground px-2 py-1 rounded bg-muted/50">

                        <div className="w-3 h-3 rounded border border-border" />

                        <span className="flex-1">{st}</span>

                        <button onClick={() => setNewTask(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, j) => j !== i) }))} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>

                      </div>

                    ))}

                  </div>

                  <input

                    value={newSubtaskInput}

                    onChange={e => setNewSubtaskInput(e.target.value)}

                    onKeyDown={e => e.key === "Enter" && addSubtask()}

                    placeholder="+ Add subtask"

                    className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"

                  />

                </div>



                {/* Notes */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Additional Notes</label>

                  <textarea

                    value={newTask.notes}

                    onChange={e => setNewTask(prev => ({ ...prev, notes: e.target.value }))}

                    placeholder="Any extra notes..."

                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[50px]"

                  />

                </div>



                {/* Notifications & Watchers */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Bell className="w-3 h-3" /> Notifications</label>

                    <button

                      onClick={() => setNewTask(prev => ({ ...prev, notifications: !prev.notifications }))}

                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${

                        newTask.notifications ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"

                      }`}

                    >

                      {newTask.notifications ? "On" : "Off"}

                    </button>

                  </div>

                  <div>

                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Watchers</label>

                    <Select value={newTask.watchers[0]} onValueChange={v => setNewTask(prev => ({ ...prev, watchers: [v, ...prev.watchers.slice(1)] }))}>

                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>

                      <SelectContent>

                        <SelectItem value="You">You</SelectItem>

                        <SelectItem value="Alice Kim">Alice Kim</SelectItem>

                        <SelectItem value="John Doe">John Doe</SelectItem>

                        <SelectItem value="Team">Entire Team</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>



                {/* Attachments placeholder */}

                <div>

                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Paperclip className="w-3 h-3" /> Attachments</label>

                  <button className="w-full px-3 py-3 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">

                    Click to attach files

                  </button>

                </div>



                {/* Create button */}

                <button

                  onClick={handleCreateTask}

                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"

                >

                  Create Task

                </button>

              </div>

            </div>

          </SheetContent>

        </Sheet>

        <AIChatWidget />

      </div>

    </GlobalContextMenu>

  );

}



export type { PinnedTask };

export { usePinnedTasks };
