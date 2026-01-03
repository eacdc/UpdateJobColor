import { jobsAPI } from './api.js';

// Collapsible panels
document.querySelectorAll(".panel--collapsible .panel-header").forEach((header) => {
  header.addEventListener("click", () => {
    const panel = header.closest(".panel--collapsible");
    panel?.classList.toggle("panel-collapsed");
  });
});

// Job search
const jobSearchForm = document.getElementById('jobSearchForm');
const jobSearchError = document.getElementById('jobSearchError');
const jobNumberInput = document.getElementById('jobNumber');
const jobNumberDropdown = document.getElementById('jobNumberDropdown');
let searchTimeout = null;

// Handle job number input - search when 4+ digits entered
jobNumberInput.addEventListener('input', async (e) => {
  const value = e.target.value.trim();
  
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Hide dropdown if less than 4 characters
  if (value.length < 4) {
    jobNumberDropdown.style.display = 'none';
    return;
  }

  // Debounce search (wait 300ms after user stops typing)
  searchTimeout = setTimeout(async () => {
    try {
      console.log('🔍 [FRONTEND] Searching job numbers for:', value);
      const jobNumbers = await jobsAPI.searchJobNumbersForUpdate(value);
      console.log('🔍 [FRONTEND] Received jobNumbers:', jobNumbers);
      console.log('🔍 [FRONTEND] jobNumbers type:', typeof jobNumbers, 'isArray:', Array.isArray(jobNumbers));
      
      if (jobNumbers && jobNumbers.length > 0) {
        // Populate dropdown
        jobNumberDropdown.innerHTML = '';
        jobNumbers.forEach(jobNum => {
          const item = document.createElement('div');
          item.style.padding = '10px 14px';
          item.style.cursor = 'pointer';
          item.style.borderBottom = '1px solid rgba(55, 65, 81, 0.5)';
          item.style.color = '#f9fafb';
          item.style.fontSize = '0.9rem';
          item.textContent = jobNum;
          item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
          });
          item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
          });
          item.addEventListener('click', () => {
            jobNumberInput.value = jobNum;
            jobNumberDropdown.style.display = 'none';
            // Trigger job details fetch
            fetchJobDetails(jobNum);
          });
          jobNumberDropdown.appendChild(item);
        });
        jobNumberDropdown.style.display = 'block';
        console.log('🔍 [FRONTEND] Dropdown populated with', jobNumbers.length, 'items');
      } else {
        console.log('🔍 [FRONTEND] No job numbers found or empty array');
        jobNumberDropdown.style.display = 'none';
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error searching job numbers:', error);
      jobNumberDropdown.style.display = 'none';
    }
  }, 300);
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  const jobSearchPanel = jobSearchForm.closest('.panel');
  if (jobSearchPanel && !jobSearchPanel.contains(e.target)) {
    jobNumberDropdown.style.display = 'none';
  }
});

// Function to fetch job details from MSSQL for update job card app
async function fetchJobDetails(jobNumber) {
  try {
    const jobDetails = await jobsAPI.getJobDetailsForUpdate(jobNumber);
    
    // Populate job details section with new fields
    document.getElementById('clientName').value = jobDetails.clientName || '';
    document.getElementById('jobName').value = jobDetails.jobName || '';
    document.getElementById('orderQuantity').value = jobDetails.orderQuantity || 0;
    document.getElementById('poDate').value = jobDetails.poDate || '-';
  } catch (error) {
    console.error('Error fetching job details:', error);
    // Fallback to default values if error
    document.getElementById('clientName').value = '';
    document.getElementById('jobName').value = '';
    document.getElementById('orderQuantity').value = 0;
    document.getElementById('poDate').value = '';
    
    jobSearchError.textContent = error.message || 'Failed to fetch job details.';
    jobSearchError.className = 'inline-warning';
    jobSearchError.style.display = 'block';
  }
}

// Store full color data for later use
let fullColorData = null;
let originalColorData = null; // Store original data to track changes
let hasChanges = false; // Track if any changes were made
let currentJobNumber = null; // Store current job number
let currentPlanContName = null; // Store selected plan content name

// Function to show save button
function showSaveButton() {
  hasChanges = true;
  const saveActions = document.querySelector('.color-cards-actions');
  if (saveActions) {
    saveActions.style.display = 'flex';
  }
}

// Function to hide save button
function hideSaveButton() {
  hasChanges = false;
  const saveActions = document.querySelector('.color-cards-actions');
  if (saveActions) {
    saveActions.style.display = 'none';
  }
}

// Function to reset all fields
function resetAllFields() {
  // Clear job details
  document.getElementById('clientName').value = '';
  document.getElementById('jobName').value = '';
  document.getElementById('orderQuantity').value = 0;
  document.getElementById('poDate').value = '';
  
  // Clear and hide PlanContName dropdown
  const planContNameSelect = document.getElementById('planContName');
  const planContNameMessage = document.getElementById('planContNameMessage');
  planContNameSelect.innerHTML = '<option value="">Select Plan Content Name</option>';
  planContNameSelect.style.display = 'none';
  planContNameMessage.style.display = 'none';
  
  // Hide color cards section
  document.getElementById('colorCardsSection').style.display = 'none';
  
  // Clear color cards content
  document.getElementById('frontContent').innerHTML = '<p class="no-colors-message">No colors found</p>';
  document.getElementById('spFrontContent').innerHTML = '<p class="no-colors-message">No colors found</p>';
  document.getElementById('backContent').innerHTML = '<p class="no-colors-message">No colors found</p>';
  document.getElementById('spBackContent').innerHTML = '<p class="no-colors-message">No colors found</p>';
  
  // Clear job number input
  document.getElementById('jobNumber').value = '';
  
  // Reset variables
  fullColorData = null;
  originalColorData = null;
  hasChanges = false;
  currentJobNumber = null;
  currentPlanContName = null;
  
  // Hide save button
  hideSaveButton();
}

// Function to fetch and populate PlanContName dropdown
async function fetchPlanContNames(jobNumber) {
  const planContNameSelect = document.getElementById('planContName');
  const planContNameMessage = document.getElementById('planContNameMessage');
  
  try {
    planContNameSelect.style.display = 'none';
    planContNameMessage.style.display = 'block';
    planContNameMessage.textContent = 'Loading...';
    
    const colorDetails = await jobsAPI.getJobColorDetails(jobNumber);
    
    // Store full data for color cards
    fullColorData = colorDetails.fullData || null;
    
    // Clear existing options except the first one
    planContNameSelect.innerHTML = '<option value="">Select Plan Content Name</option>';
    
    if (colorDetails.planContNames && colorDetails.planContNames.length > 0) {
      // Add options for each PlanContName
      colorDetails.planContNames.forEach(planContName => {
        const option = document.createElement('option');
        option.value = planContName;
        option.textContent = planContName;
        planContNameSelect.appendChild(option);
      });
      
      planContNameSelect.style.display = 'block';
      planContNameMessage.style.display = 'none';
      
      // Remove existing event listeners and add new one
      const newSelect = planContNameSelect.cloneNode(true);
      planContNameSelect.parentNode.replaceChild(newSelect, planContNameSelect);
      document.getElementById('planContName').addEventListener('change', handlePlanContNameChange);
    } else {
      planContNameMessage.textContent = 'No Plan Content Names found for this job.';
      planContNameMessage.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching plan content names:', error);
    planContNameMessage.textContent = 'Failed to load Plan Content Names.';
    planContNameMessage.style.display = 'block';
    planContNameSelect.style.display = 'none';
  }
}

// Function to handle PlanContName selection and display color cards
function handlePlanContNameChange(e) {
  const selectedPlanContName = e.target.value;
  const colorCardsSection = document.getElementById('colorCardsSection');
  
  // Store the selected plan content name
  currentPlanContName = selectedPlanContName;
  
  if (!selectedPlanContName || !fullColorData || !fullColorData.Contents) {
    colorCardsSection.style.display = 'none';
    currentPlanContName = null;
    return;
  }
  
  // Find the selected content
  const selectedContent = fullColorData.Contents.find(
    content => content.PlanContName === selectedPlanContName
  );
  
  if (!selectedContent || !selectedContent.Colors) {
    colorCardsSection.style.display = 'none';
    return;
  }
  
  // Group colors by ColorSpecification
  const colorsBySpec = {
    'Front': [],
    'Sp. Front': [],
    'Back': [],
    'Sp. Back': []
  };
  
  selectedContent.Colors.forEach(color => {
    const spec = color.ColorSpecification || color.FormSide || '';
    if (colorsBySpec.hasOwnProperty(spec)) {
      colorsBySpec[spec].push(color);
    }
  });
  
  // Populate color cards
  populateColorCard('frontContent', colorsBySpec['Front']);
  populateColorCard('spFrontContent', colorsBySpec['Sp. Front']);
  populateColorCard('backContent', colorsBySpec['Back']);
  populateColorCard('spBackContent', colorsBySpec['Sp. Back']);
  
  // Store original data for comparison
  originalColorData = JSON.parse(JSON.stringify(selectedContent));
  
  // Reset changes tracking
  hasChanges = false;
  hideSaveButton();
  
  // Show the color cards section
  colorCardsSection.style.display = 'block';
  
  // Initialize save button handler
  initializeSaveButton();
}

// Function to create a color item row
function createColorItemRow(color = null, isNew = false) {
  const colorItem = document.createElement('div');
  colorItem.className = 'color-item-row';
  
  if (isNew) {
    // New row with dropdown
    colorItem.innerHTML = `
      <div class="color-item-controls">
        <button class="color-item-btn color-item-btn--add" type="button" title="Add item">+</button>
        <button class="color-item-btn color-item-btn--remove" type="button" title="Remove row">-</button>
      </div>
      <select class="color-item-dropdown" data-item-id="">
        <option value="">Select Item...</option>
      </select>
    `;
    
    const dropdown = colorItem.querySelector('.color-item-dropdown');
    
    // Load items for dropdown
    loadItemsForDropdown(dropdown).then(() => {
      // Add change event listener to dropdown
      dropdown.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption && selectedOption.value) {
          // Replace dropdown with item name
          const itemName = selectedOption.textContent;
          const itemId = selectedOption.value;
          
          // Determine which card this is in to set ColorSpecification
          const cardContent = colorItem.closest('.color-card-content');
          let colorSpec = '';
          if (cardContent) {
            const cardId = cardContent.id;
            if (cardId === 'frontContent') colorSpec = 'Front';
            else if (cardId === 'spFrontContent') colorSpec = 'Sp. Front';
            else if (cardId === 'backContent') colorSpec = 'Back';
            else if (cardId === 'spBackContent') colorSpec = 'Sp. Back';
          }
          
          colorItem.innerHTML = `
            <div class="color-item-controls">
              <button class="color-item-btn color-item-btn--add" type="button" title="Add item">+</button>
              <button class="color-item-btn color-item-btn--remove" type="button" title="Remove item">-</button>
            </div>
            <div class="color-item-name" data-item-id="${itemId}" data-color-spec="${colorSpec}">${itemName}</div>
          `;
          
          // Re-attach event listeners
          attachColorItemListeners(colorItem);
          
          // Show save button when item is selected
          showSaveButton();
        }
      });
    });
  } else {
    // Existing row with item name
    const itemId = color.ItemID || color.itemId || '';
    const colorSpec = color.ColorSpecification || color.FormSide || '';
    colorItem.innerHTML = `
      <div class="color-item-controls">
        <button class="color-item-btn color-item-btn--add" type="button" title="Add item">+</button>
        <button class="color-item-btn color-item-btn--remove" type="button" title="Remove item">-</button>
      </div>
      <div class="color-item-name" data-item-id="${itemId}" data-color-spec="${colorSpec}">${color.ItemName || 'N/A'}</div>
    `;
  }
  
  // Attach event listeners
  attachColorItemListeners(colorItem);
  
  // Show save button when item is added
  if (isNew) {
    showSaveButton();
  }
  
  return colorItem;
}

// Function to attach event listeners to color item row
function attachColorItemListeners(colorItem) {
  const addBtn = colorItem.querySelector('.color-item-btn--add');
  const removeBtn = colorItem.querySelector('.color-item-btn--remove');
  
  if (addBtn) {
    // Remove existing listeners by cloning
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    newAddBtn.addEventListener('click', () => {
      const cardContent = colorItem.parentElement;
      const newRow = createColorItemRow(null, true);
      cardContent.insertBefore(newRow, colorItem.nextSibling);
    });
  }
  
  if (removeBtn) {
    // Remove existing listeners by cloning
    const newRemoveBtn = removeBtn.cloneNode(true);
    removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
    newRemoveBtn.addEventListener('click', () => {
      colorItem.remove();
      showSaveButton(); // Show save button when item is deleted
      // If no items left, show "No colors found" message with add button
      const cardContent = colorItem.parentElement;
      if (cardContent.children.length === 0) {
        const addRowBtn = document.createElement('button');
        addRowBtn.className = 'add-first-item-btn';
        addRowBtn.textContent = '+ Add Item';
        addRowBtn.type = 'button';
        addRowBtn.addEventListener('click', () => {
          const newRow = createColorItemRow(null, true);
          cardContent.innerHTML = '';
          cardContent.appendChild(newRow);
        });
        cardContent.appendChild(addRowBtn);
      }
    });
  }
}

// Function to load items for dropdown
async function loadItemsForDropdown(dropdown) {
  try {
    const response = await jobsAPI.getItemsForColor();
    if (response.items && response.items.length > 0) {
      response.items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.itemId || '';
        option.textContent = item.itemName || '';
        option.setAttribute('data-item-name', item.itemName || '');
        dropdown.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading items for dropdown:', error);
  }
}

// Function to populate a color card with color items
function populateColorCard(cardContentId, colors) {
  const cardContent = document.getElementById(cardContentId);
  cardContent.innerHTML = '';
  
  if (!colors || colors.length === 0) {
    // Add a + button to add new items even when no colors exist
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'add-first-item-btn';
    addRowBtn.textContent = '+ Add Item';
    addRowBtn.type = 'button';
    addRowBtn.addEventListener('click', () => {
      const newRow = createColorItemRow(null, true);
      cardContent.innerHTML = '';
      cardContent.appendChild(newRow);
    });
    cardContent.appendChild(addRowBtn);
    return;
  }
  
  colors.forEach(color => {
    const colorItem = createColorItemRow(color, false);
    cardContent.appendChild(colorItem);
  });
}

// Function to gather all color data from cards in the same format as stored procedure output
function gatherColorData() {
  if (!currentJobNumber || !currentPlanContName || !fullColorData) {
    return null;
  }
  
  // Find the index of the selected content from original data
  const selectedContentIndex = fullColorData.Contents.findIndex(
    content => content.PlanContName === currentPlanContName
  );
  
  if (selectedContentIndex === -1) {
    return null;
  }
  
  const selectedContent = fullColorData.Contents[selectedContentIndex];
  
  // Helper function to extract colors from a card
  function extractColorsFromCard(cardContentId, defaultColorSpec) {
    const cardContent = document.getElementById(cardContentId);
    if (!cardContent) return [];
    
    const rows = cardContent.querySelectorAll('.color-item-row');
    const colors = [];
    
    rows.forEach(row => {
      const itemNameEl = row.querySelector('.color-item-name');
      if (itemNameEl && itemNameEl.textContent && itemNameEl.textContent !== 'N/A') {
        const itemId = itemNameEl.getAttribute('data-item-id');
        const colorSpec = itemNameEl.getAttribute('data-color-spec') || defaultColorSpec;
        colors.push({
          ColorSpecification: colorSpec,
          FormSide: colorSpec,
          ItemGroupID: 3,
          ItemID: itemId ? parseInt(itemId) : null,
          ItemName: itemNameEl.textContent
        });
      }
    });
    
    return colors;
  }
  
  // Extract colors from all cards for the selected container
  const allColors = [];
  allColors.push(...extractColorsFromCard('frontContent', 'Front'));
  allColors.push(...extractColorsFromCard('spFrontContent', 'Sp. Front'));
  allColors.push(...extractColorsFromCard('backContent', 'Back'));
  allColors.push(...extractColorsFromCard('spBackContent', 'Sp. Back'));
  
  // Build only the selected/updated content object
  const updatedContent = {
    JobBookingJobCardContentsID: selectedContent.JobBookingJobCardContentsID || null,
    PlanContName: selectedContent.PlanContName,
    PlanContType: selectedContent.PlanContType || null,
    PlanContQty: selectedContent.PlanContQty || null,
    Colors: allColors  // Updated colors from the UI
  };
  
  // Return only the selected content (not all contents)
  return {
    JobNumber: fullColorData.JobNumber || currentJobNumber,
    JobBookingID: fullColorData.JobBookingID || null,
    Contents: [updatedContent]  // Only the selected/updated content
  };
}

jobSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const jobNumber = jobNumberInput.value.trim();
  
  jobSearchError.style.display = 'none';
  jobSearchError.className = 'inline-warning'; // Reset to warning class
  jobNumberDropdown.style.display = 'none';

  if (!jobNumber) {
    jobSearchError.textContent = 'Please enter a job number.';
    jobSearchError.style.display = 'block';
    return;
  }

  try {
    // Store current job number
    currentJobNumber = jobNumber;
    
    // Fetch job details to display
    await fetchJobDetails(jobNumber);
    
    // Fetch and populate PlanContName dropdown
    await fetchPlanContNames(jobNumber);
    
    // Show success message
    jobSearchError.textContent = 'Job details loaded successfully!';
    jobSearchError.className = 'inline-success';
    jobSearchError.style.display = 'block';
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      jobSearchError.style.display = 'none';
    }, 2000);
  } catch (error) {
    console.error('Error loading job details:', error);
    // Clear job details if fetch fails
    document.getElementById('clientName').value = '';
    document.getElementById('jobName').value = '';
    document.getElementById('orderQuantity').value = 0;
    document.getElementById('poDate').value = '';
    
    // Clear dropdown
    const planContNameSelect = document.getElementById('planContName');
    const planContNameMessage = document.getElementById('planContNameMessage');
    planContNameSelect.innerHTML = '<option value="">Select Plan Content Name</option>';
    planContNameSelect.style.display = 'none';
    planContNameMessage.style.display = 'none';
    
    // Hide color cards section
    document.getElementById('colorCardsSection').style.display = 'none';
    fullColorData = null;
    currentJobNumber = null;
    currentPlanContName = null;
    
    jobSearchError.textContent = error.message || 'Failed to load job details.';
    jobSearchError.className = 'inline-warning';
    jobSearchError.style.display = 'block';
  }
});

// Initialize save button handler when color cards section is shown
function initializeSaveButton() {
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    // Remove existing listeners by cloning
    const newBtn = saveChangesBtn.cloneNode(true);
    saveChangesBtn.parentNode.replaceChild(newBtn, saveChangesBtn);
    
    // Add new event listener
    document.getElementById('saveChangesBtn').addEventListener('click', async () => {
      try {
        const colorData = gatherColorData();
        
        console.log('💾 [FRONTEND] Gathering color data...');
        console.log('💾 [FRONTEND] Color data:', colorData);
        
        if (!colorData) {
          console.error('💾 [FRONTEND] No color data to save');
          jobSearchError.textContent = 'No data to save.';
          jobSearchError.className = 'inline-warning';
          jobSearchError.style.display = 'block';
          return;
        }
        
        const btn = document.getElementById('saveChangesBtn');
        
        // Disable button during save
        btn.disabled = true;
        btn.textContent = 'Saving...';
        
        console.log('💾 [FRONTEND] Sending color data to API...');
        console.log('💾 [FRONTEND] JSON to send:', JSON.stringify(colorData, null, 2));
        
        // Call API to save changes
        const result = await jobsAPI.saveColorChanges(colorData);
        
        console.log('💾 [FRONTEND] API response received:', result);
        
        // Check if save was successful
        if (result && result.success) {
          // Show success message
          jobSearchError.textContent = 'Changes saved successfully!';
          jobSearchError.className = 'inline-success';
          jobSearchError.style.display = 'block';
          
          // Reset all fields after successful save
          resetAllFields();
          
          // Hide success message after 2 seconds
          setTimeout(() => {
            jobSearchError.style.display = 'none';
          }, 2000);
        } else {
          throw new Error(result?.error || 'Failed to save changes');
        }
        
      } catch (error) {
        console.error('Error saving changes:', error);
        jobSearchError.textContent = error.message || 'Failed to save changes.';
        jobSearchError.className = 'inline-warning';
        jobSearchError.style.display = 'block';
      } finally {
        // Re-enable button
        const btn = document.getElementById('saveChangesBtn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Save Changes';
        }
      }
    });
  }
}
