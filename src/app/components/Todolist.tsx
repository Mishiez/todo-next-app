'use client';

import { useState, useEffect } from 'react';
import {
  useRetrieveProjectsQuery,
  useCreateProjectMutation,
  useCreateProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useDeleteProjectMutation
} from '../../../lib/generated/graphql';

interface Task {
  text: string;
  completed: boolean;
}

interface Project {
  name: string;
  tasks: Task[];
  completed: boolean;
}

export default function TodoListSimple() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { data } = useRetrieveProjectsQuery();

  const [createProjectMutation] = useCreateProjectMutation();
  const [createTaskMutation] = useCreateProjectTaskMutation();
  const [deleteTaskMutation] = useDeleteProjectTaskMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation();

  useEffect(() => {
    const loginStatus = localStorage.getItem('loggedIn');
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (data?.retrieveProjects) {
      const transformed = data.retrieveProjects.map((p) => ({
        name: p.name,
        tasks: [],
        completed: false
      }));
      setProjects(transformed);
    }
  }, [data]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('loggedIn', 'true');
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('loggedIn');
    setIsLoggedIn(false);
  };

  const addProject = async () => {
    if (newProjectName.trim()) {
      const dueDate = new Date('2025-12-31T00:00:00.000Z');
      const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} ${String(dueDate.getHours() + 3).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}:${String(dueDate.getSeconds()).padStart(2, '0')}.000000 +0300`;

      await createProjectMutation({
        variables: {
          args: {
            name: newProjectName,
            description: 'Created from frontend',
            dateDue: formattedDate
          }
        }
      });
      setProjects([...projects, { name: newProjectName, tasks: [], completed: false }]);
      setNewProjectName('');
    }
  };

  const addTask = async () => {
    if (newTask.trim() && selectedProjectIndex !== null) {
      await createTaskMutation({
        variables: {
          args: {
            name: newTask,
            description: 'Task added from frontend',
            projectId: selectedProjectIndex + 1
          }
        }
      });
      const updatedProjects = projects.map((project, index) =>
        index === selectedProjectIndex
          ? { ...project, tasks: [...project.tasks, { text: newTask, completed: false }] }
          : project
      );
      setProjects(updatedProjects);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (projectIndex: number, taskIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex
        ? {
            ...project,
            tasks: project.tasks.map((task, tIndex) =>
              tIndex === taskIndex ? { ...task, completed: !task.completed } : task
            )
          }
        : project
    );
    setProjects(updatedProjects);
  };

  const toggleProjectCompletion = (projectIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex ? { ...project, completed: !project.completed } : project
    );
    setProjects(updatedProjects);
  };

  const deleteTask = async (projectIndex: number, taskIndex: number) => {
    await deleteTaskMutation({
      variables: { taskId: taskIndex + 1 }
    });
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex
        ? { ...project, tasks: project.tasks.filter((_, tIndex) => tIndex !== taskIndex) }
        : project
    );
    setProjects(updatedProjects);
  };

  const deleteProject = async (projectIndex: number) => {
    await deleteProjectMutation({
      variables: { projectId: projectIndex + 1 }
    });
    const updatedProjects = projects.filter((_, pIndex) => pIndex !== projectIndex);
    setProjects(updatedProjects);
    if (selectedProjectIndex === projectIndex) {
      setSelectedProjectIndex(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100 to-orange-200 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-yellow-800 text-center mb-6">Welcome Back!</h2>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-yellow-500 text-white p-4 rounded-xl hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-200 flex flex-col items-center justify-center p-6">
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-xl w-full max-w-3xl mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Todo Adventure</h1>
          <p className="text-base mt-2 text-orange-50">
            Current Time: {new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}
          </p>
          <button
            onClick={logout}
            className="mt-4 bg-white text-yellow-700 px-5 py-2 rounded-full hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 border border-yellow-200 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-yellow-800 mb-8 text-center">Your Projects & Tasks</h2>

        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              className="flex-1 p-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Add a new project..."
            />
            <button
              onClick={addProject}
              className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newProjectName.trim()}
            >
              Add Project
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              className="flex-1 p-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              value={selectedProjectIndex ?? ''}
              onChange={(e) => setSelectedProjectIndex(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Select a project</option>
              {projects.map((project, index) => (
                <option key={index} value={index}>
                  {project.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="flex-1 p-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              disabled={selectedProjectIndex === null}
            />
            <button
              onClick={addTask}
              className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedProjectIndex === null || !newTask.trim()}
            >
              Add Task
            </button>
          </div>
        </div>

        {projects.map((project, pIndex) => (
          <div key={pIndex} className="bg-yellow-50 rounded-xl p-4 mb-6 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-yellow-900">{project.name}</h3>
              <button
                onClick={() => deleteProject(pIndex)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete Project
              </button>
            </div>
            <ul className="space-y-2">
              {project.tasks.map((task, tIndex) => (
                <li key={tIndex} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                  <span className={task.completed ? 'line-through text-gray-400' : 'text-yellow-900'}>
                    {task.text}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => toggleTaskCompletion(pIndex, tIndex)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      {task.completed ? 'Undo' : 'Done'}
                    </button>
                    <button
                      onClick={() => deleteTask(pIndex, tIndex)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}