// Utility functions for formatting and helpers

// Format currency (LKR)
export const formatCurrency = (amount: number): string => {
  if (amount == null || isNaN(amount)) return 'LKR 0.00';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format date and time
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format time only
export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM from HH:MM:SS
};

// Get status color
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    ACTIVE: 'bg-green-100 text-green-800',
    DISABLED: 'bg-gray-100 text-gray-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Get seat class label
export const getSeatClassLabel = (seatClass: string): string => {
  const labels: Record<string, string> = {
    FIRST: '1st Class',
    SECOND: '2nd Class',
    THIRD: '3rd Class',
  };
  
  return labels[seatClass] || seatClass;
};

// Get user role label
export const getUserRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrator',
    STATION_MASTER: 'Station Master',
    CUSTOMER: 'Customer',
  };
  
  return labels[role] || role;
};

// Validate NIC
export const isValidNIC = (nic: string): boolean => {
  const oldFormat = /^\d{9}[vVxX]$/;
  const newFormat = /^\d{12}$/;
  
  return oldFormat.test(nic) || newFormat.test(nic);
};

// Validate mobile number
export const isValidMobile = (mobile: string): boolean => {
  return /^0\d{9}$/.test(mobile);
};

// Generate date string for input (YYYY-MM-DD)
export const getDateInputValue = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get minimum booking date (today)
export const getMinBookingDate = (): string => {
  return getDateInputValue(new Date());
};

// Get maximum booking date (90 days from now)
export const getMaxBookingDate = (): string => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return getDateInputValue(maxDate);
};

// Truncate text
export const truncate = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Download QR code
export const downloadQRCode = (base64: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Calculate age from NIC
export const getAgeFromNIC = (nic: string): number | null => {
  try {
    let year: number;
    
    if (nic.length === 10) {
      // Old format: YYMMMDDDDC
      year = parseInt(nic.substring(0, 2));
      year = year < 50 ? 2000 + year : 1900 + year;
    } else if (nic.length === 12) {
      // New format: YYYYMMMDDDDC
      year = parseInt(nic.substring(0, 4));
    } else {
      return null;
    }
    
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  } catch (error) {
    return null;
  }
};
