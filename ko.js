// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  const themeIcon = themeToggle.querySelector('i');
  
  themeToggle.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
    const orgFilter = document.getElementById('orgFilter');
    const statusFilter = document.getElementById('statusFilter');
    const electionCards = document.querySelectorAll('.election-card');
    const noResultsMessage = document.getElementById('no-results-message'); // Optional if you use it
  
    if (!orgFilter || !statusFilter || electionCards.length === 0) return;
  
    function getDisplayName(orgValue) {
      const names = {
        sac: "Student Activity Council",
        ncc: "National Cadet Corps",
        nss: "National Service Scheme",
        cultural: "Cultural Clubs",
        academic: "Academic Clubs",
      };
      return names[orgValue] || orgValue;
    }
  
    function getStatusDisplayName(statusValue) {
      const statusNames = {
        active: "Active",
        upcoming: "Upcoming",
        completed: "Completed",
      };
      return statusNames[statusValue] || statusValue;
    }
  
    function filterElections() {
      const selectedOrg = orgFilter.value;
      const selectedStatus = statusFilter.value;
      let visibleCount = 0;
  
      electionCards.forEach(card => {
        const cardOrg = card.getAttribute('data-org');
        const cardStatus = card.getAttribute('data-status');
  
        const orgMatch = selectedOrg === 'all' || cardOrg === selectedOrg;
        const statusMatch = selectedStatus === 'all' || cardStatus === selectedStatus;
  
        const showCard = orgMatch && statusMatch;
        card.style.display = showCard ? '' : 'none';
  
        if (showCard) visibleCount++;
      });
  
      if (visibleCount === 0 && selectedOrg !== 'all' && selectedStatus !== 'all') {
        const orgName = getDisplayName(selectedOrg);
        const statusName = getStatusDisplayName(selectedStatus);
        alert(`${orgName} does not have any ${statusName} elections.`);
      }
  
      // Optional: hide/show a "No results found" message in the DOM
      if (noResultsMessage) {
        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }
  
    orgFilter.addEventListener('change', filterElections);
    statusFilter.addEventListener('change', filterElections);
  
    // Initial filter
    filterElections();
  });
 //