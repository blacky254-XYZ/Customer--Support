const ADMIN_PASSWORD = "Yasin254";

function login() {
  const pass = document.getElementById("adminPassword").value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    loadComplaints();
  } else {
    alert("❌ Invalid password. Try again.");
    document.getElementById("adminPassword").value = "";
  }
}

function logout() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("adminPassword").value = "";
}

async function loadComplaints() {
  try {
    const statusFilter = document.getElementById("statusFilter").value;
    
    let query = client.from("complaints").select("*").order("created_at", { ascending: false });
    
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    
    let { data, error } = await query;

    if (error) {
      console.error("Error loading complaints:", error);
      alert("Error loading complaints");
      return;
    }

    const totalTickets = data ? data.length : 0;
    document.getElementById("ticketCount").innerHTML = `Total Tickets: <span class="text-blue-400">${totalTickets}</span>`;

    let html = "";
    if (data && data.length > 0) {
      data.forEach(complaint => {
        const createdAt = new Date(complaint.created_at).toLocaleString();
        const statusColor = complaint.status === "Pending" ? "bg-yellow-900 text-yellow-400" :
                          complaint.status === "In Progress" ? "bg-blue-900 text-blue-400" :
                          "bg-green-900 text-green-400";
        
        html += `
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">#${complaint.reference_number}</span>
                  <span class="px-3 py-1 rounded-full text-sm font-semibold ${statusColor}">${complaint.status}</span>
                </div>
                <p class="text-zinc-500 text-sm">${createdAt}</p>
              </div>
              <button onclick="copyToClipboard('${complaint.reference_number}')" class="text-zinc-400 hover:text-zinc-100 transition-colors">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-zinc-500 text-sm">Name</p>
                  <p class="font-semibold">${complaint.full_name}</p>
                </div>
                <div>
                  <p class="text-zinc-500 text-sm">Email</p>
                  <p class="font-semibold text-blue-400">${complaint.email}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-zinc-500 text-sm">Phone</p>
                  <p class="font-semibold">${complaint.phone || "N/A"}</p>
                </div>
                <div>
                  <p class="text-zinc-500 text-sm">Company</p>
                  <p class="font-semibold">${complaint.company || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <p class="text-zinc-500 text-sm">Issue Type</p>
                <p class="font-semibold text-orange-400">${complaint.category}</p>
              </div>
              
              <div>
                <p class="text-zinc-500 text-sm">Message</p>
                <p class="mt-1 p-3 bg-zinc-950 rounded-xl text-sm border border-zinc-800">${complaint.message}</p>
              </div>
            </div>
            
            <div class="flex gap-3 pt-4 border-t border-zinc-800">
              <button onclick="updateStatus('${complaint.id}', 'In Progress')" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all">
                <i class="fa-solid fa-spinner mr-2"></i> In Progress
              </button>
              <button onclick="updateStatus('${complaint.id}', 'Resolved')" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-all">
                <i class="fa-solid fa-check mr-2"></i> Resolved
              </button>
              <button onclick="deleteComplaint('${complaint.id}')" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-all">
                <i class="fa-solid fa-trash mr-2"></i> Delete
              </button>
            </div>
          </div>
        `;
      });
    } else {
      html = `
        <div class="bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-800">
          <i class="fa-solid fa-inbox text-5xl text-zinc-700 mb-4"></i>
          <p class="text-zinc-400 text-lg">No support requests yet</p>
        </div>
      `;
    }

    document.getElementById("complaintsList").innerHTML = html;
  } catch (err) {
    console.error(err);
    alert("Error loading complaints: " + err.message);
  }
}

async function updateStatus(id, newStatus) {
  try {
    let { error } = await client.from("complaints").update({ status: newStatus }).eq("id", id);
    if (!error) {
      alert(`✅ Status updated to: ${newStatus}`);
      loadComplaints();
    } else {
      alert("Error updating status");
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteComplaint(id) {
  if (confirm("Are you sure you want to delete this complaint?")) {
    try {
      let { error } = await client.from("complaints").delete().eq("id", id);
      if (!error) {
        alert("✅ Complaint deleted");
        loadComplaints();
      } else {
        alert("Error deleting complaint");
      }
    } catch (err) {
      console.error(err);
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`📋 Copied: ${text}`);
  });
}