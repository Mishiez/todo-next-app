'use client';

import { useState, useEffect } from 'react';

interface Task {
  text: string;
  completed: boolean;
}

interface Project {
  name: string;
  tasks: Task[];
}

export default function TodoListSimple() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Add a new project
  const addProject = () => {
    if (newProjectName.trim()) {
      setProjects([...projects, { name: newProjectName, tasks: [] }]);
      setNewProjectName('');
    }
  };

  // Add a task to the selected project
  const addTask = () => {
    if (newTask.trim() && selectedProjectIndex !== null) {
      const updatedProjects = projects.map((project, index) =>
        index === selectedProjectIndex
          ? { ...project, tasks: [...project.tasks, { text: newTask, completed: false }] }
          : project
      );
      setProjects(updatedProjects);
      setNewTask('');
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (projectIndex: number, taskIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex
        ? {
            ...project,
            tasks: project.tasks.map((task, tIndex) =>
              tIndex === taskIndex ? { ...task, completed: !task.completed } : task
            ),
          }
        : project
    );
    setProjects(updatedProjects);
  };

  // Delete a task
  const deleteTask = (projectIndex: number, taskIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex
        ? { ...project, tasks: project.tasks.filter((_, tIndex) => tIndex !== taskIndex) }
        : project
    );
    setProjects(updatedProjects);
  };

  // Delete a project
  const deleteProject = (projectIndex: number) => {
    const updatedProjects = projects.filter((_, pIndex) => pIndex !== projectIndex);
    setProjects(updatedProjects);
    if (selectedProjectIndex === projectIndex) {
      setSelectedProjectIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-300">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-bold">Simple Todo List</h1>
          <p className="text-sm mt-2 opacity-90">
            Current Time: Tuesday, May 27, 2025, 12:22 PM EAT
          </p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Projects and Tasks</h2>

          {/* Form to add a new project */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Add a new project..."
              />
              <button
                onClick={addProject}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                Add Project
              </button>
            </div>
          </div>

          {/* Form to add a task to a selected project */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <select
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedProjectIndex !== null ? selectedProjectIndex : ''}
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
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                disabled={selectedProjectIndex === null}
              />
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={selectedProjectIndex === null}
              >
                Add Task
              </button>
            </div>
          </div>

          {/* List of projects and their tasks */}
          {projects.length === 0 ? (
            <p className="text-gray-600 text-center py-6 bg-gray-50 rounded-lg">No projects yet. Add one to get started!</p>
          ) : (
            <div className="space-y-6">
              {projects.map((project, projectIndex) => (
                <div key={projectIndex} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
                    <button
                      onClick={() => deleteProject(projectIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    >
                      Delete Project
                    </button>
                  </div>
                  {project.tasks.length === 0 ? (
                    <p className="text-gray-500 italic">No tasks yet. Add some to this project!</p>
                  ) : (
                    <ul className="space-y-3">
                      {project.tasks.map((task, taskIndex) => (
                        <li
                          key={taskIndex}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <span
                            className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                            onClick={() => toggleTaskCompletion(projectIndex, taskIndex)}
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => deleteTask(projectIndex, taskIndex)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}