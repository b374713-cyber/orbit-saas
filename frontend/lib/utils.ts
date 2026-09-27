import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getHealthColor(health: 'HEALTHY' | 'AT_RISK' | 'CRITICAL') {
  switch (health) {
    case 'HEALTHY':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'AT_RISK':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'CRITICAL':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function getPriorityColor(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'URGENT':
      return 'bg-red-100 text-red-700 border-red-200';
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'BACKLOG':
      return 'bg-gray-100 text-gray-700';
    case 'TODO':
      return 'bg-blue-100 text-blue-700';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-700';
    case 'REVIEW':
      return 'bg-purple-100 text-purple-700';
    case 'DONE':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}