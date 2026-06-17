let records = JSON.parse(localStorage.getItem('meterRecords')) || [];
let editIndex = null; // Kaunsa record edit ho raha hai

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

function saveToStorage() {
  localStorage.setItem('meterRecords', JSON.stringify(records));
}

// Table render with action buttons
function renderTable() {
  const tbody = document.querySelector('#recordTable tbody');
  tbody.innerHTML = '';
  records.forEach((rec, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(rec.date)}</td>
      <td>${rec.start}</td>
      <td>${rec.end ?? '—'}</td>
      <td>${rec.totalKM !== null && rec.totalKM >= 0 ? rec.totalKM : '—'}</td>
      <td class="actions-cell">
        <button class="edit-btn" onclick="editRecord(${index})" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="delete-btn" onclick="deleteRecord(${index})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Edit button: form fill karega
function editRecord(index) {
  const rec = records[index];
  document.getElementById('date').value = rec.date;
  document.getElementById('startMeter').value = rec.start;
  document.getElementById('endMeter').value = rec.end ?? '';
  document.getElementById('addUpdateBtn').textContent = 'Update Record';
  editIndex = index;
  // Scroll to input card
  document.querySelector('.input-card').scrollIntoView({ behavior: 'smooth' });
}

// Delete button with confirmation
function deleteRecord(index) {
  if (confirm('Kya aap waqai yeh record delete karna chahte hain?')) {
    // Agar edit mode mein wahi record tha to edit cancel karo
    if (editIndex === index) {
      resetForm();
    } else if (editIndex !== null && index < editIndex) {
      // Agar koi aur record edit ho raha hai aur delete hone se index shift ho sakta hai
      // to editIndex adjust karo agar zaroorat ho
      editIndex--;
    }
    records.splice(index, 1);
    saveToStorage();
    renderTable();
  }
}

// Add or Update record
function addRecord() {
  const date = document.getElementById('date').value;
  const start = document.getElementById('startMeter').value;
  const end = document.getElementById('endMeter').value;

  if (!date || !start) {
    alert("Date aur Start Meter dono bharna zaroori hai!");
    return;
  }

  const startNum = parseInt(start);
  const endNum = end ? parseInt(end) : null;
  const totalKM = (endNum !== null && !isNaN(endNum)) ? endNum - startNum : null;

  const recordData = {
    date,
    start: startNum,
    end: endNum,
    totalKM: totalKM !== null && totalKM >= 0 ? totalKM : null
  };

  if (editIndex !== null) {
    // Update existing record
    records[editIndex] = recordData;
  } else {
    // Add new record
    records.push(recordData);
  }

  saveToStorage();
  renderTable();
  resetForm();
}

// Reset form and button to default
function resetForm() {
  setTodayDate();
  document.getElementById('startMeter').value = '';
  document.getElementById('endMeter').value = '';
  document.getElementById('addUpdateBtn').textContent = 'Add Record';
  editIndex = null;
}

// Export JSON
function exportJSON() {
  const dataStr = JSON.stringify(records, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bike-km-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import JSON
function importJSON() {
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          records = imported;
          saveToStorage();
          renderTable();
          resetForm(); // edit mode bhi cancel
          alert('Data bahaal kar diya gaya!');
        } else {
          alert('JSON format theek nahi hai!');
        }
      } catch (err) {
        alert('File parse nahi ho saki!');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  };
}

// Set today date in input
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  document.getElementById('date').value = today;
}

// Update footer date
function updateFooterDate() {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  document.getElementById('currentDate').textContent = today;
}

function clearAllRecords() {
  if (records.length === 0) {
    alert('Koi record mojood nahi hai!');
    return;
  }
  if (confirm('Kya aap waqai saare records delete karna chahte hain? Ye action undo nahi ho sakta.')) {
    records = [];
    saveToStorage();
    renderTable();
    resetForm();  // agar edit mode mein ho to form bhi reset ho jaye
    alert('Sare records delete kar diye gaye.');
  }
}

// Initial setup
setTodayDate();
updateFooterDate();
renderTable();
