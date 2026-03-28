export const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.accessor ? col.accessor(row) : row[col.key];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCharitiesCSV = (charities) => {
  const columns = [
    { key: 'name', label: 'Charity Name' },
    { key: 'isActive', label: 'Status', accessor: (row) => row.isActive ? 'Active' : 'Inactive' },
    { key: 'totalRaised', label: 'Total Raised', accessor: (row) => `$${row.totalRaised.toFixed(2)}` },
    { key: 'totalIndependentDonations', label: 'Direct Donations', accessor: (row) => `$${row.totalIndependentDonations.toFixed(2)}` },
    { key: 'donationCount', label: 'Donation Count' },
    { key: 'allocationPercent', label: 'Allocation %' }
  ];
  exportToCSV(charities, 'charity_report', columns);
};

export const exportWinnersCSV = (winners, tiers) => {
  const rows = winners.flatMap(winner => ({
    userName: winner.userName || 'Unknown',
    userEmail: winner.userEmail || 'Unknown',
    totalWinnings: winner.totalWinnings,
    winCount: winner.winCount
  }));
  
  const columns = [
    { key: 'userName', label: 'Winner Name' },
    { key: 'userEmail', label: 'Email' },
    { key: 'winCount', label: 'Number of Wins' },
    { key: 'totalWinnings', label: 'Total Winnings', accessor: (row) => `$${row.totalWinnings.toFixed(2)}` }
  ];
  exportToCSV(rows, 'winner_report', columns);
};

export const exportUsersCSV = (users, roleDistribution) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status', accessor: (row) => row.isActive ? 'Active' : 'Inactive' },
    { key: 'createdAt', label: 'Member Since', accessor: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];
  exportToCSV(users, 'user_report', columns);
};
