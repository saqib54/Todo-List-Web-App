// --- DOM Elements ---
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskPriority = document.getElementById('task-priority');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-percentage');
const dateDisplay = document.getElementById('date-display');

// --- State ---
let tasks = JSON.parse(localStorage.getItem('pro_tasks')) || [];
let editTaskId = null;
let currentFilter = 'all';

// Set today's date in header
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateDisplay.innerText = new Date().toLocaleDateString('en-US', options);

// --- Core Functions ---
function saveAndRender() {
    localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    renderTasks();
    updateProgress();
}

function updateProgress() {
    if (tasks.length === 0) {
        progressFill.style.width = '0%';
        progressText.innerText = '0%';
        return;
    }
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    
    progressFill.style.width = `${percentage}%`;
    progressText.innerText = `${percentage}%`;

    // Change progress bar color based on completion
    if (percentage === 100) progressFill.style.background = 'var(--low-pri)';
    else if (percentage > 50) progressFill.style.background = 'var(--primary)';
    else progressFill.style.background = 'var(--med-pri)';
}

function renderTasks() {
    taskList.innerHTML = '';
    
    // Apply Filters
    let filteredTasks = tasks;
    if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

    // Show/Hide Empty State
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            // Format Date safely
            let dateHtml = '';
            if (task.dueDate) {
                const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dateHtml = `<span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>`;
            }

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})">
                <div class="task-details">
                    <span class="task-title">${task.text}</span>
                    <div class="task-meta">
                        <span class="badge pri-${task.priority}"><i class="fas fa-flag"></i> ${task.priority}</span>
                        ${dateHtml}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }
}

// --- Interactions ---
function handleAddOrUpdate() {
    const text = taskInput.value.trim();
    if (!text) {
        alert("Task description cannot be empty!");
        return;
    }

    if (editTaskId !== null) {
        // Update
        const task = tasks.find(t => t.id === editTaskId);
        task.text = text;
        task.dueDate = taskDate.value;
        task.priority = taskPriority.value;
        
        editTaskId = null;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    } else {
        // Add
        tasks.unshift({
            id: Date.now(),
            text: text,
            dueDate: taskDate.value,
            priority: taskPriority.value,
            completed: false
        });
    }

    // Reset Form
    taskInput.value = '';
    taskDate.value = '';
    taskPriority.value = 'Medium';
    
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    taskInput.value = task.text;
    taskDate.value = task.dueDate;
    taskPriority.value = task.priority;
    
    editTaskId = id;
    addBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveAndRender();
}

// --- Filter Logic ---
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// --- Event Listeners ---
addBtn.addEventListener('click', handleAddOrUpdate);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddOrUpdate();
});

// Initialize
saveAndRender();