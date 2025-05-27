// @ts-nocheck - Ignoring all type errors for Material Tailwind components
"use client";

import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Progress,
  List,
  ListItem,
  ListItemPrefix,
  Checkbox,
} from "@material-tailwind/react";

// Mock data for upcoming tasks
const upcomingTasksData = [
  {
    id: 1,
    title: "GST/HST Filing Due",
    description: "Q2 2025 GST/HST Return",
    dueDate: "2025-07-31T23:59:59",
    priority: "high",
    completed: false,
    category: "tax"
  },
  {
    id: 2,
    title: "Reconcile Bank Accounts",
    description: "May 2025 Reconciliation",
    dueDate: "2025-06-10T23:59:59",
    priority: "medium",
    completed: false,
    category: "banking"
  },
  {
    id: 3,
    title: "Review Unpaid Invoices",
    description: "Follow up on overdue payments",
    dueDate: "2025-06-05T23:59:59",
    priority: "medium",
    completed: false,
    category: "accounts-receivable"
  },
  {
    id: 4,
    title: "Payroll Processing",
    description: "June 2025 Payroll",
    dueDate: "2025-06-15T23:59:59",
    priority: "high",
    completed: false,
    category: "payroll"
  },
  {
    id: 5,
    title: "Update Chart of Accounts",
    description: "Add new expense categories",
    dueDate: "2025-06-20T23:59:59",
    priority: "low",
    completed: true,
    category: "accounting"
  }
];

export default function UpcomingTasks() {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'amber';
      case 'low':
        return 'green';
      default:
        return 'blue-gray';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'tax':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
          </svg>
        );
      case 'banking':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
            <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
          </svg>
        );
      case 'accounts-receivable':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a3.833 3.833 0 001.719-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a3.833 3.833 0 00-1.718-.756V8.334c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
          </svg>
        );
      case 'payroll':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        );
      case 'accounting':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Get background color based on category
  const getCategoryBgColor = (category: string) => {
    switch(category) {
      case 'tax':
        return 'bg-blue-50 text-blue-500';
      case 'banking':
        return 'bg-purple-50 text-purple-500';
      case 'accounts-receivable':
        return 'bg-green-50 text-green-500';
      case 'payroll':
        return 'bg-amber-50 text-amber-500';
      case 'accounting':
        return 'bg-indigo-50 text-indigo-500';
      default:
        return 'bg-blue-gray-50 text-blue-gray-500';
    }
  };

  // Calculate completion percentage
  const completedTasks = upcomingTasksData.filter(task => task.completed).length;
  const totalTasks = upcomingTasksData.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Sort tasks by due date and filter out completed tasks for display
  const sortedTasks = [...upcomingTasksData]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .filter(task => !task.completed);

  return (
    <Card className="shadow-sm">
      <CardHeader floated={false} shadow={false} className="rounded-none p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Typography variant="h5" color="blue-gray">
              Upcoming Tasks
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Your pending bookkeeping tasks
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outlined" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
              Add Task
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Typography variant="small" color="blue-gray">
              {completedTasks} of {totalTasks} tasks completed
            </Typography>
            <Typography variant="small" color="blue-gray">
              {completionPercentage}%
            </Typography>
          </div>
          <Progress value={completionPercentage} color="blue" />
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <List>
          {sortedTasks.map((task, index) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            const isOverdue = daysRemaining < 0;
            
            return (
              <ListItem key={task.id} className="py-3 px-4">
                <ListItemPrefix>
                  <Checkbox 
                    id={`task-${task.id}`} 
                    ripple={false} 
                    className="hover:before:opacity-0"
                    containerProps={{
                      className: "p-0"
                    }}
                  />
                </ListItemPrefix>
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${getCategoryBgColor(task.category)}`}>
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        {task.title}
                      </Typography>
                      <Typography variant="small" color="gray" className="font-normal">
                        {task.description}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={task.priority}
                      color={getPriorityColor(task.priority)}
                      className="capitalize"
                    />
                    <Typography 
                      variant="small" 
                      color={isOverdue ? "red" : "blue-gray"} 
                      className="font-medium whitespace-nowrap"
                    >
                      {isOverdue ? 'Overdue' : `Due ${formatDate(task.dueDate)}`}
                    </Typography>
                  </div>
                </div>
              </ListItem>
            );
          })}
        </List>
      </CardBody>
    </Card>
  );
}
